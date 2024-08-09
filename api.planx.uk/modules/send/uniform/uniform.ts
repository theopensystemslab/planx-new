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

interface UniformClient {
  clientId: string;
  clientSecret: string;
}

interface UniformSubmissionResponse {
  submissionStatus?: string;
  canDownload?: boolean;
  submissionId?: string;
}

interface RawUniformAuthResponse {
  access_token: string;
}

interface UniformAuthResponse {
  token: string;
  organisation: string;
  organisationId: string;
}

interface UniformApplication {
  id: string;
  idox_submission_id: string;
  submission_reference: string;
  destination: string;
  response: UniformSubmissionResponse;
  created_at: string;
}

interface SendToUniformPayload {
  sessionId: string;
}

export async function sendToUniform(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  /**
   * Submits application data to Uniform
   *
   *   first, create a zip folder containing an XML (Idox's schema), CSV (our format), and any user-uploaded files
   *   then, make requests to Uniform's "Submission API" to authenticate, create a submission, and attach the zip to the submission
   *   finally, insert a record into uniform_applications for future auditing
   */
  req.setTimeout(120 * 1000); // Temporary bump to address submission timeouts

  // `/uniform/:localAuthority` is only called via Hasura's scheduled event webhook now, so body is wrapped in a "payload" key
  const payload: SendToUniformPayload = req.body.payload;
  if (!payload?.sessionId) {
    return next({
      status: 400,
      message: "Missing application data to send to Uniform",
    });
  }

  const localAuthority = req.params.localAuthority;
  const uniformClient = getUniformClient(localAuthority);

  if (!uniformClient) {
    return next({
      status: 400,
      message: `Idox/Uniform connector is not enabled for this local authority (${localAuthority})`,
    });
  }

  // confirm that this session has not already been successfully submitted before proceeding
  const submittedApp = await checkUniformAuditTable(payload?.sessionId);
  const isAlreadySubmitted =
    submittedApp?.submissionStatus === "PENDING" && submittedApp?.canDownload;
  if (isAlreadySubmitted) {
    return res.status(200).send({
      sessionId: payload?.sessionId,
      idoxSubmissionId: submittedApp?.submissionId,
      message: `Skipping send, already successfully submitted`,
    });
  }

  try {
    // Request 1/4 - Authenticate
    const { token, organisation, organisationId } =
      await authenticate(uniformClient);

    // 2/4 - Create a submission
    const idoxSubmissionId = await createSubmission(
      token,
      organisation,
      organisationId,
      payload.sessionId,
    );

    // 3/4 - Create & attach the zip
    const zip = await buildSubmissionExportZip({
      sessionId: payload.sessionId,
      includeOneAppXML: true,
    });

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
      message: `Successfully created a Uniform submission`,
      zipAttached: attachmentAdded,
      application: applicationAuditRecord,
    });
  } catch (error) {
    const errorMessage = isAxiosError(error)
      ? JSON.stringify(error.response?.data)
      : (error as Error).message;
    return next({
      error,
      message: `Failed to send to Uniform (${localAuthority}): ${errorMessage}`,
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
}: UniformClient): Promise<UniformAuthResponse> {
  const authString = Buffer.from(`${clientId}:${clientSecret}`).toString(
    "base64",
  );

  const authConfig: AxiosRequestConfig = {
    method: "POST",
    url: process.env.UNIFORM_TOKEN_URL!,
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

  const response = await axios.request<RawUniformAuthResponse>(authConfig);

  if (!response.data.access_token) {
    throw Error("Failed to authenticate to Uniform - no access token returned");
  }

  // Decode access_token to get "organisation-name" & "organisation-id"
  const decodedAccessToken = jwt.decode(response.data.access_token) as any;
  const organisation = decodedAccessToken?.["organisation-name"];
  const organisationId = decodedAccessToken?.["organisation-id"];

  if (!organisation || !organisationId) {
    throw Error(
      "Failed to authenticate to Uniform - failed to decode organisation details from access_token",
    );
  }

  const uniformAuthResponse: UniformAuthResponse = {
    token: response.data.access_token,
    organisation: organisation,
    organisationId: organisationId,
  };

  return uniformAuthResponse;
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
  const createSubmissionEndpoint = `${process.env
    .UNIFORM_SUBMISSION_URL!}/secure/submission`;

  const isStaging = ["mock-server", "staging"].some((hostname) =>
    createSubmissionEndpoint.includes(hostname),
  );

  const createSubmissionConfig: AxiosRequestConfig = {
    url: createSubmissionEndpoint,
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-type": "application/json",
    },
    data: JSON.stringify({
      entity: "dc",
      module: "dc",
      organisation: organisation,
      organisationId: organisationId,
      submissionReference: sessionId,
      description: isStaging
        ? "Staging submission from PlanX"
        : "Production submission from PlanX",
      submissionProcessorType: "API",
    }),
  };

  const response = await axios.request(createSubmissionConfig);
  // successful submission returns 201 Created without body
  if (response.status !== 201) throw Error("Failed to authenticate to Uniform");

  // parse & return the submissionId
  const resourceLink = response.headers.location;
  const submissionId = resourceLink.split("/").pop();
  if (!submissionId)
    throw Error("Authenticated to Uniform, but failed to create submission");

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

  const attachArchiveEndpoint = `${process.env
    .UNIFORM_SUBMISSION_URL!}/secure/submission/${submissionId}/archive`;

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
  console.log("*** Uniform attachArchive response ***");
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
    .UNIFORM_SUBMISSION_URL!}/secure/submission/${submissionId}`;

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
 * Get id and secret of Uniform client which matches the provided Local Authority
 */
const getUniformClient = (localAuthority: string): UniformClient => {
  // Greedily match any non-word characters
  // XXX: Matches regex used in IAC (getCustomerSecrets.ts)
  const regex = new RegExp(/\W+/g);
  const client =
    process.env[
      "UNIFORM_CLIENT_" + localAuthority.replace(regex, "_").toUpperCase()
    ];

  if (!client)
    throw Error(`Unable to get Uniform client for ${localAuthority}`);

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
  payload: SendToUniformPayload;
  localAuthority: string;
  submissionDetails: UniformSubmissionResponse;
}): Promise<UniformApplication> => {
  const xml = await $api.export.oneAppPayload(payload?.sessionId);

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
      xml,
    },
  );

  return application.insert_uniform_applications_one;
};
