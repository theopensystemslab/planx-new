import "isomorphic-fetch";
import os from "os";
import { reportError } from "../airbrake";
import { Buffer } from "node:buffer";
import path from "path";
import FormData from "form-data";
import fs from "fs";
import AdmZip from "adm-zip";
import str from "string-to-stream";
import { stringify } from "csv-stringify";
import {
  hasRequiredDataForTemplate,
  generateDocxTemplateStream,
  generateHTMLMapStream,
  generateHTMLOverviewStream,
} from "@opensystemslab/planx-document-templates";
import { adminGraphQLClient } from "../hasura";
import { markSessionAsSubmitted } from "../saveAndReturn/utils";
import { gql } from "graphql-request";
import { deleteFile, downloadFile, findGeoJSON } from "./helpers";
import { UniformPayload } from "./UniformPayload/model";

const client = adminGraphQLClient;

/**
 * Submits application data to Uniform
 *
 *   first, create a zip folder containing an XML (Idox's schema), CSV (our format), and any user-uploaded files
 *   then, make requests to Uniform's "Submission API" to authenticate, create a submission, and attach the zip to the submission
 *   finally, insert a record into uniform_applications for future auditing
 */
const sendToUniform = async (req, res, next) => {
  if (!getUniformClient(req.params.localAuthority)) {
    return next({
      status: 400,
      message: "Idox/Uniform connector is not enabled for this local authority",
    });
  }

  // `/uniform/:localAuthority` is only called via Hasura's scheduled event webhook now, so body is wrapped in a "payload" key
  const { payload } = req.body;
  if (!payload?.sessionId || !payload?.passport || !payload.planXExportData) {
    return next({
      status: 400,
      message: "Missing application data to send to Uniform",
    });
  }

  // confirm that this session has not already been successfully submitted before proceeding
  const submittedApp = await checkUniformAuditTable(payload?.sessionId);
  if (
    submittedApp?.submissionStatus === "PENDING" &&
    submittedApp?.canDownload
  ) {
    return res.status(200).send({
      sessionId: payload?.sessionId,
      idoxSubmissionId: submittedApp?.submissionId,
      message: `Skipping send, already successfully submitted`,
    });
  }

  // generate submission documents and data
  const { uniformSubmissionXML, geojson, templateNames } =
    await generateSubmissionData({
      sessionId: payload.sessionId,
      passport: payload.passport,
      files: payload.files,
    });

  try {
    const { clientId, clientSecret } = getUniformClient(
      req.params.localAuthority
    );

    // Setup - Create the zip folder
    const zipPath = await createUniformSubmissionZip({
      sessionId: payload.sessionId,
      passport: payload.passport,
      planXExportData: payload.planXExportData,
      files: payload.files,
      geojson,
      templateNames,
      uniformSubmissionXML,
    });

    // Request 1/3 - Authenticate
    const {
      access_token: token,
      "organisation-name": organisation,
      "organisation-id": organisationId,
    } = await authenticate(clientId, clientSecret);

    // 2/3 - Create a submission
    if (token) {
      const idoxSubmissionId = await createSubmission(
        token,
        organisation,
        organisationId,
        payload?.sessionId
      );

      // 3/3 - Attach the zip & create an audit entry
      if (idoxSubmissionId) {
        const attachmentAdded = await attachArchive(
          token,
          idoxSubmissionId,
          zipPath
        );
        if (attachmentAdded) {
          deleteFile(zipPath);
        }

        const submissionDetails = await retrieveSubmission(
          token,
          idoxSubmissionId
        );
        const application = await client.request(
          gql`
            mutation CreateUniformApplication(
              $idox_submission_id: String = ""
              $submission_reference: String = ""
              $destination: String = ""
              $response: jsonb = ""
              $payload: jsonb = ""
            ) {
              insert_uniform_applications_one(
                object: {
                  idox_submission_id: $idox_submission_id
                  submission_reference: $submission_reference
                  destination: $destination
                  response: $response
                  payload: $payload
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
            destination: req.params.localAuthority,
            response: submissionDetails,
            payload: req.body.payload,
          }
        );

        // Mark session as submitted so that reminder and expiry emails are not triggered
        markSessionAsSubmitted(payload?.sessionId);

        return res.status(200).send({
          message: `Successfully created a Uniform submission`,
          zipAttached: attachmentAdded,
          application: application.insert_uniform_applications_one,
        });
      } else {
        return res.status(403).send({
          message: `Authenticated to Uniform, but failed to create submission`,
        });
      }
    } else {
      return res.status(401).send({
        message: `Failed to authenticate to Uniform`,
      });
    }
  } catch (error) {
    return next({
      error,
      message: `Failed to send to Uniform. ${error}`,
    });
  }
};

/**
 * Query the Uniform audit table to see if we already have an application for this session
 * @param {string} sessionId
 * @returns {object|undefined} most recent uniform_applications.response
 */
async function checkUniformAuditTable(sessionId) {
  const application = await client.request(
    `
      query FindApplication(
        $submission_reference: String = ""
      ) {
        uniform_applications(
          where: {
            submission_reference: {_eq: $submission_reference}
          },
          order_by: {created_at: desc}
        ) {
          response
        }
      }
    `,
    {
      submission_reference: sessionId,
    }
  );

  return application?.uniform_applications[0]?.response;
}

/**
 * Creates a zip folder containing the documents required by Uniform
 * @param {any} data - an array of objects representing our custom PlanX data export format
 * @param {object[]} files - an array of user-uploaded files
 * @param {string} sessionId
 * @returns {Promise} - name of zip
 */
export async function createUniformSubmissionZip({
  sessionId,
  passport,
  planXExportData,
  files,
  geojson,
  templateNames,
  uniformSubmissionXML,
}) {
  // initiate an empty zip folder
  const zip = new AdmZip();

  // make a tmp directory to avoid file name collisions if simultaneous applications
  let tmpDir = "";
  fs.mkdtemp(path.join(os.tmpdir(), sessionId), (err, folder) => {
    if (err) throw err;
    tmpDir = folder;
  });

  // download any user-uploaded files from S3 to the tmp directory, add them to the zip
  if (files) {
    for (let file of files) {
      // Ensure unique filename by combining original filename and S3 folder name, which is a nanoid
      // Uniform requires all uploaded files to be present in the zip, even if they are duplicates
      // Must match unique filename in editor.planx.uk/src/@planx/components/Send/uniform/xml.ts
      const uniqueFilename = decodeURIComponent(
        file.split("/").slice(-2).join("-")
      );
      const filePath = path.join(tmpDir, uniqueFilename);
      await downloadFile(file, filePath, zip);
    }
  }

  // add a CSV file with submission data to zip
  const csvPath = path.join(tmpDir, "application.csv");
  const csvFile = fs.createWriteStream(csvPath);
  const csvStream = stringify(planXExportData, {
    columns: ["question", "responses", "metadata"],
    header: true,
  }).pipe(csvFile);
  await waitForStream(csvStream);
  zip.addLocalFile(csvPath);
  deleteFile(csvPath);

  // add a XML uniform submission file to zip
  const xmlPath = "proposal.xml"; //  must be named "proposal.xml" to be processed by Uniform
  const xmlFile = fs.createWriteStream(xmlPath);
  const xmlStream = str(uniformSubmissionXML.trim()).pipe(xmlFile);
  await waitForStream(xmlStream);
  zip.addLocalFile(xmlPath);
  deleteFile(xmlPath);

  // generate and add an HTML overview document for the submission to zip
  const overviewPath = path.join(tmpDir, "overview.html");
  const overviewFile = fs.createWriteStream(overviewPath);
  const overviewStream =
    generateHTMLOverviewStream(planXExportData).pipe(overviewFile);
  await waitForStream(overviewStream);
  zip.addLocalFile(overviewPath);
  deleteFile(overviewPath);

  // add an optional GeoJSON file to zip
  if (geojson) {
    const geoBuff = Buffer.from(JSON.stringify(geojson, null, 2));
    zip.addFile("boundary.geojson", geoBuff);

    // generate and add an HTML boundary document for the submission to zip
    const boundaryPath = path.join(tmpDir, "boundary.html");
    const boundaryFile = fs.createWriteStream(boundaryPath);
    const boundaryStream = generateHTMLMapStream(geojson).pipe(boundaryFile);
    await waitForStream(boundaryStream);
    zip.addLocalFile(boundaryPath);
    deleteFile(boundaryPath);
  }

  // generate and add additional submission documents
  for (const templateName of templateNames) {
    let isTemplateSupported = false;
    try {
      isTemplateSupported = hasRequiredDataForTemplate({
        templateName,
        passport,
      });
    } catch (e) {
      reportError(
        `The template "${templateName}" could not be generated with the supplied data:\n${e}`
      );
    }
    if (isTemplateSupported) {
      const templatePath = path.join(tmpDir, templateName);
      const templateFile = fs.createWriteStream(templatePath);
      const templateStream = generateDocxTemplateStream({
        templateName,
        passport,
      }).pipe(templateFile);
      await waitForStream(templateStream);
      zip.addLocalFile(templatePath);
      deleteFile(templatePath);
    }
  }

  // create the zip file
  const zipName = `ripa-test-${sessionId}.zip`;
  zip.writeZip(zipName);

  // cleanup tmp directory
  fs.rm(tmpDir, { recursive: true }, (err) => {
    if (err) throw err;
  });

  return zipName;
}

async function generateSubmissionData({ sessionId, passport, files }) {
  const geojson = findGeoJSON(passport);
  const templateNames = await getSubmissionTemplates(sessionId);
  const uniformSubmissionXML = generateUniformSubmissionXML({
    sessionId,
    passport,
    files,
    hasBoundary: !!geojson,
    templateNames,
  });
  return {
    geojson,
    templateNames,
    uniformSubmissionXML,
  };
}

async function waitForStream(stream) {
  return await new Promise((resolve, reject) => {
    stream.on("error", reject);
    stream.on("finish", resolve);
  });
}

export function generateUniformSubmissionXML({
  sessionId,
  passport,
  files,
  hasBoundary,
  templates,
}) {
  const payload = new UniformPayload({
    sessionId,
    passport,
    files,
    hasBoundary,
    templates,
  });
  const xml = payload.buildXML();
  return xml;
}

/**
 * Logs in to the Idox Submission API using a username/password
 *   and returns an access token
 *
 * @param {string} clientId - idox-generated client ID
 * @param {string} clientSecret - idox-generated client secret
 * @returns {Promise} - access token
 */
async function authenticate(clientId, clientSecret) {
  const authEndpoint = process.env.UNIFORM_TOKEN_URL;

  const authOptions = {
    method: "POST",
    headers: new Headers({
      Authorization:
        "Basic " +
        Buffer.from(clientId + ":" + clientSecret).toString("base64"),
      "Content-type": "application/x-www-form-urlencoded",
    }),
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "client_credentials",
    }),
    redirect: "follow",
  };

  return await fetch(authEndpoint, authOptions).then((response) =>
    response.json()
  );
}

/**
 * Creates a submission (submissionReference is unique value provided by RIPA & must match XML <portaloneapp:RefNum>)
 *   and returns a submissionId parsed from the resource link
 *
 * @param {string} token - access token retrieved from idox authentication
 * @param {string} organisation - idox-generated organisation name
 * @param {number} organisationId - idox-generated organisation id
 * @param {string} sessionId - ripa-generated sessionId
 * @returns {Promise} - idox-generated submissionId
 */
async function createSubmission(
  token,
  organisation,
  organisationId,
  sessionId = "TEST"
) {
  const createSubmissionEndpoint =
    process.env.UNIFORM_SUBMISSION_URL + "/secure/submission";
  const isStaging = process.env.UNIFORM_SUBMISSION_URL.includes("staging");

  const createSubmissionOptions = {
    method: "POST",
    headers: new Headers({
      Authorization: `Bearer ${token}`,
      "Content-type": "application/json",
    }),
    body: JSON.stringify({
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
    redirect: "follow",
  };

  return await fetch(createSubmissionEndpoint, createSubmissionOptions).then(
    (response) => {
      // successful submission returns 201 Created without body
      if (response.status === 201) {
        // parse & return the submissionId
        const resourceLink = response.headers.get("location");
        return resourceLink.split("/").pop();
      }
    }
  );
}

/**
 * Uploads and attaches a zip folder to an existing submission
 *
 * @param {string} token - access token retrieved from idox authentication
 * @param {string} submissionId - idox-generated UUID returned in the resource link of the submission
 * @param {string} zipPath - file path to an existing zip folder (2GB limit)
 * @returns {Promise} - "zipAttached" boolean for our audit record because retrieveSubmission response will include archive.href regardless
 */
async function attachArchive(token, submissionId, zipPath) {
  if (!fs.existsSync(zipPath)) {
    console.log(
      `Zip does not exist, cannot attach to idox_submission_id ${submissionId}`
    );
    return false;
  }

  const attachArchiveEndpoint =
    process.env.UNIFORM_SUBMISSION_URL +
    `/secure/submission/${submissionId}/archive`;

  const formData = new FormData();
  formData.append("file", fs.createReadStream(zipPath));

  const attachArchiveOptions = {
    method: "POST",
    headers: new Headers({
      Authorization: `Bearer ${token}`,
    }),
    body: formData,
    redirect: "follow",
  };

  return await fetch(attachArchiveEndpoint, attachArchiveOptions).then(
    (response) => {
      // successful upload returns 204 No Content without body
      if (response.status === 204) {
        return true;
      }
    }
  );
}

/**
 * Gets details about an existing submission to store for auditing purposes
 *   since neither createSubmission nor attachArchive requests return a meaningful response body
 *
 * @param {string} token - access token retrieved from idox authentication
 * @param {string} submissionId - idox-generated UUID returned in the resource link of the submission
 * @returns {Promise}
 */
async function retrieveSubmission(token, submissionId) {
  const getSubmissionEndpoint =
    process.env.UNIFORM_SUBMISSION_URL + `/secure/submission/${submissionId}`;

  const getSubmissionOptions = {
    method: "GET",
    headers: new Headers({
      Authorization: `Bearer ${token}`,
    }),
    redirect: "follow",
  };

  return await fetch(getSubmissionEndpoint, getSubmissionOptions).then(
    (response) => response.json()
  );
}

async function getSubmissionTemplates(sessionId) {
  const response = await client.request(
    gql`
      query GetSubmissionTemplateNames($sessionId: uuid!) {
        lowcal_sessions_by_pk(id: $sessionId) {
          flow {
            submission_templates
          }
        }
      }
    `,
    { sessionId }
  );
  const templates = response.lowcal_sessions_by_pk?.flow?.submission_templates;
  if (!templates || templates == "") return [];
  return templates.split(",");
}

/**
 * Get id and secret of Uniform client which matches the provided Local Authority
 * @param {string} localAuthority
 * @returns {object}
 */
const getUniformClient = (localAuthority) => {
  // Greedily match any non-word characters
  // XXX: Matches regex used in IAC (getCustomerSecrets.ts)
  const regex = new RegExp(/\W+/g);
  const client =
    process.env[
      "UNIFORM_CLIENT_" + localAuthority.replace(regex, "_").toUpperCase()
    ];

  // If we can't find secrets, return undefined to trigger a 400 error using next() in sendToUniform()
  if (!client) return undefined;

  const [clientId, clientSecret] = client.split(":");
  return { clientId, clientSecret };
};

export { sendToUniform };
