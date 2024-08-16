import axios, { AxiosRequestConfig, isAxiosError } from "axios";
import { NextFunction, Request, Response } from "express";
import FormData from "form-data";
import fs from "fs";
import { gql } from "graphql-request";
import jwt from "jsonwebtoken";
import { Buffer } from "node:buffer";
import { $api } from "../../../client/index.js";
import { markSessionAsSubmitted } from "../../saveAndReturn/service/utils.js";
import { buildSubmissionExportZip } from "../utils/exportZip.js";

interface IdoxNexusClient {
  clientId: string;
  clientSecret: string;
}

interface RawIdoxNexusAuthResponse {
  access_token: string;
}

interface IdoxNexusAuthResponse {
  token: string;
  organisations: Record<string, string>;
  authorities: string[];
}

interface UniformSubmissionResponse {
  submissionStatus?: string;
  canDownload?: boolean;
  submissionId?: string;
}

interface UniformApplication {
  id: string;
  idox_submission_id: string;
  submission_reference: string;
  destination: string;
  response: UniformSubmissionResponse;
  created_at: string;
}

interface SendToIdoxNexusPayload {
  sessionId: string;
}

export async function sendToIdoxNexus(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  /**
   * Submits application data to Idox's Submission API (aka Nexus)
   *
   *   first, create a zip folder containing the ODP Schema JSON
   *   then, make requests to Uniform's "Submission API" to authenticate, create a submission, and attach the zip to the submission
   *   finally, insert a record into uniform_applications for future auditing
   */
  req.setTimeout(120 * 1000); // Temporary bump to address submission timeouts

  // `/idox/:localAuthority` is only called via Hasura's scheduled event webhook now, so body is wrapped in a "payload" key
  const payload: SendToIdoxNexusPayload = req.body.payload;
  if (!payload?.sessionId) {
    return next({
      status: 400,
      message: "Missing application data to send to Idox Nexus",
    });
  }

  // localAuthority is only parsed for audit record, not client-specific
  const localAuthority = req.params.localAuthority;
  const idoxNexusClient = getIdoxNexusClient();

  // confirm that this session has not already been successfully submitted before proceeding
  const submittedApp = await checkUniformAuditTable(payload?.sessionId);
  const _isAlreadySubmitted =
    submittedApp?.submissionStatus === "PENDING" && submittedApp?.canDownload;
  // if (isAlreadySubmitted) {
  //   return res.status(200).send({
  //     sessionId: payload?.sessionId,
  //     idoxSubmissionId: submittedApp?.submissionId,
  //     message: `Skipping send, already successfully submitted`,
  //   });
  // }

  try {
    // Request 1/4 - Authenticate
    const { token, organisations } = await authenticate(idoxNexusClient);

    // TEMP - Mock organisations do NOT correspond to council envs, so randomly alternate submissions among ones we have access to for initial testing
    //   Switch to `team_integrations`-based approach later
    const orgIds = Object.keys(organisations);
    const randomOrgId = orgIds[Math.floor(Math.random() * orgIds.length)];
    const randomOrg = organisations[randomOrgId];

    // Create a zip containing only the ODP Schema JSON
    //   Do this BEFORE creating a submission in order to throw any validation errors early
    const zip = await buildSubmissionExportZip({
      sessionId: payload.sessionId,
      onlyDigitalPlanningJSON: true,
    });

    // 2/4 - Create a submission
    const idoxSubmissionId = await createSubmission(
      token,
      randomOrg,
      randomOrgId,
      payload.sessionId,
    );

    // 3/4 - Attach the zip
    const attachmentAdded = await attachArchive(
      token,
      idoxSubmissionId,
      zip.filename,
    );

    // clean-up zip file
    zip.remove();

    // 4/4 - Get submission details and create audit record
    const submissionDetails = await retrieveSubmission(token, idoxSubmissionId);
    const applicationAuditRecord = await createUniformApplicationAuditRecord({
      idoxSubmissionId,
      submissionDetails,
      payload,
      localAuthority,
    });

    // Mark session as submitted so that reminder and expiry emails are not triggered
    markSessionAsSubmitted(payload?.sessionId);

    return res.status(200).send({
      message: `Successfully created an Idox Nexus submission (${randomOrgId} - ${randomOrg})`,
      zipAttached: attachmentAdded,
      application: applicationAuditRecord,
    });
  } catch (error) {
    const errorMessage = isAxiosError(error)
      ? JSON.stringify(error.response?.data)
      : (error as Error).message;
    return next({
      error,
      message: `Failed to send to Idox Nexus (${payload.sessionId}): ${errorMessage}`,
    });
  }
}

/**
 * Query the Uniform audit table to see if we already have an application for this session
 */
async function checkUniformAuditTable(
  sessionId: string,
): Promise<UniformSubmissionResponse | undefined> {
  const application: Record<"uniform_applications", UniformApplication[]> =
    await $api.client.request(
      gql`
        query FindApplication($submission_reference: String = "") {
          uniform_applications(
            where: { submission_reference: { _eq: $submission_reference } }
            order_by: { created_at: desc }
          ) {
            response
          }
        }
      `,
      {
        submission_reference: sessionId,
      },
    );

  return application?.uniform_applications[0]?.response;
}

/**
 * Logs in to the Idox Submission API using a username/password
 *   and returns an access token
 */
async function authenticate({
  clientId,
  clientSecret,
}: IdoxNexusClient): Promise<IdoxNexusAuthResponse> {
  const authString = Buffer.from(`${clientId}:${clientSecret}`).toString(
    "base64",
  );

  const authConfig: AxiosRequestConfig = {
    method: "POST",
    url: process.env.IDOX_NEXUS_TOKEN_URL!,
    headers: {
      Authorization: `Basic ${authString}`,
      "Content-type": "application/x-www-form-urlencoded",
    },
    data: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "client_credentials",
    }),
  };

  const response = await axios.request<RawIdoxNexusAuthResponse>(authConfig);

  if (!response.data.access_token) {
    throw Error(
      "Failed to authenticate to Idox Nexus - no access token returned",
    );
  }

  // Decode access_token to get "organisations" & "authorities"
  const decodedAccessToken = jwt.decode(response.data.access_token) as any;
  const organisations = decodedAccessToken?.["organisations"];
  const authorities = decodedAccessToken?.["authorities"];

  if (!organisations || !authorities) {
    throw Error(
      "Failed to authenticate to Idox Nexus - failed to decode organisations or authorities from access_token",
    );
  }

  const idoxNexusAuthResponse: IdoxNexusAuthResponse = {
    token: response.data.access_token,
    organisations: organisations,
    authorities: authorities,
  };

  return idoxNexusAuthResponse;
}

/**
 * Creates a submission (submissionReference is unique value provided by RIPA & must match XML <portaloneapp:RefNum>)
 *   and returns a submissionId parsed from the resource link
 */
async function createSubmission(
  token: string,
  organisation: string,
  organisationId: string,
  sessionId = "TEST",
): Promise<string> {
  const createSubmissionEndpoint = `${process.env.IDOX_NEXUS_SUBMISSION_URL!}/secure/submission`;

  const isStaging = ["mock-server", "staging", "dev"].some((hostname) =>
    createSubmissionEndpoint.includes(hostname),
  );

  // Get the application type prefix (eg "ldc", "pp", "pa") to send as the "entity"
  const session = await $api.session.find(sessionId);
  const rawApplicationType = session?.data.passport.data?.[
    "application.type"
  ] as string[];
  const applicationTypePrefix = rawApplicationType?.[0]?.split(".")?.[0];

  const createSubmissionConfig: AxiosRequestConfig = {
    url: createSubmissionEndpoint,
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-type": "application/json",
    },
    data: JSON.stringify({
      entity: applicationTypePrefix,
      module: "dcplanx",
      organisation: organisation,
      organisationId: organisationId,
      submissionReference: sessionId,
      description: isStaging
        ? "Staging submission from PlanX"
        : "Production submission from PlanX",
      submissionProcessorType: "PLANX_QUEUE",
    }),
  };

  const response = await axios.request(createSubmissionConfig);
  // successful submission returns 201 Created without body
  if (response.status !== 201)
    throw Error("Failed to authenticate to Idox Nexus");

  // parse & return the submissionId
  const resourceLink = response.headers.location;
  const submissionId = resourceLink.split("/").pop();
  if (!submissionId)
    throw Error("Authenticated to Idox Nexus, but failed to create submission");

  return submissionId;
}

/**
 * Uploads and attaches a zip folder to an existing submission
 */
async function attachArchive(
  token: string,
  submissionId: string,
  zipPath: string,
): Promise<boolean> {
  if (!fs.existsSync(zipPath)) {
    console.log(
      `Zip does not exist, cannot attach to idox_submission_id ${submissionId}`,
    );
    return false;
  }

  const attachArchiveEndpoint = `${process.env.IDOX_NEXUS_SUBMISSION_URL!}/secure/submission/${submissionId}/archive`;

  const formData = new FormData();
  formData.append("file", fs.createReadStream(zipPath));

  const attachArchiveConfig: AxiosRequestConfig = {
    url: attachArchiveEndpoint,
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: formData,
    // Restrict to 1GB
    maxBodyLength: 1e9,
    maxContentLength: 1e9,
  };

  const response = await axios.request(attachArchiveConfig);
  // successful upload returns 204 No Content without body
  const isSuccess = response.status === 204;

  // Temp additional logging to debug failures
  console.log("*** Idox Nexus attachArchive response ***");
  console.log({ status: response.status });
  console.log(JSON.stringify(response.data, null, 2));
  console.log("******");

  return isSuccess;
}

/**
 * Gets details about an existing submission to store for auditing purposes
 *   since neither createSubmission nor attachArchive requests return a meaningful response body
 */
async function retrieveSubmission(
  token: string,
  submissionId: string,
): Promise<UniformSubmissionResponse> {
  const getSubmissionEndpoint = `${process.env
    .IDOX_NEXUS_SUBMISSION_URL!}/secure/submission/${submissionId}`;

  const getSubmissionConfig: AxiosRequestConfig = {
    url: getSubmissionEndpoint,
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.request(getSubmissionConfig);
  return response.data;
}

/**
 * Get id and secret of Idox Nexus client
 */
const getIdoxNexusClient = (): IdoxNexusClient => {
  const client = process.env["IDOX_NEXUS_CLIENT"];

  if (!client) throw Error(`Unable to find Idox Nexus client`);

  const [clientId, clientSecret] = client.split(":");
  return { clientId, clientSecret };
};

const createUniformApplicationAuditRecord = async ({
  idoxSubmissionId,
  payload,
  localAuthority,
  submissionDetails,
}: {
  idoxSubmissionId: string;
  payload: SendToIdoxNexusPayload;
  localAuthority: string;
  submissionDetails: UniformSubmissionResponse;
}): Promise<UniformApplication> => {
  const application: Record<
    "insert_uniform_applications_one",
    UniformApplication
  > = await $api.client.request(
    gql`
      mutation CreateUniformApplication(
        $idox_submission_id: String = ""
        $submission_reference: String = ""
        $destination: String = ""
        $response: jsonb = ""
        $payload: jsonb = ""
        $xml: xml = ""
      ) {
        insert_uniform_applications_one(
          object: {
            idox_submission_id: $idox_submission_id
            submission_reference: $submission_reference
            destination: $destination
            response: $response
            payload: $payload
            xml: $xml
          }
        ) {
          id
          idox_submission_id
          submission_reference
          destination
          response
          created_at
        }
      }
    `,
    {
      idox_submission_id: idoxSubmissionId,
      submission_reference: payload?.sessionId,
      destination: localAuthority,
      response: submissionDetails,
      payload,
      xml: "ODP Schema",
    },
  );

  return application.insert_uniform_applications_one;
};
