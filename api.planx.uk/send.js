require("isomorphic-fetch");
const os = require("os");
const path = require("path");
const FormData = require("form-data");
const convert = require("xml-js");
const fs = require("fs");
const AdmZip = require("adm-zip");
const stringify = require("csv-stringify");
const { GraphQLClient } = require("graphql-request");

const client = new GraphQLClient(process.env.HASURA_GRAPHQL_URL, {
  headers: {
    "x-hasura-admin-secret": process.env.HASURA_GRAPHQL_ADMIN_SECRET,
  },
});

/**
 * Submits application data to Uniform
 * 
 *   first, create a zip folder containing an XML (Idox's schema), CSV (our format), and any user-uploaded files
 *   then, make requests to Uniform's "Submission API" to authenticate, create a submission, and attach the zip to the submission
 *   finally, insert a record into uniform_applications for future auditing
 */
const sendToUniform = async (req, res, next) => {
  if (!req.params.localAuthority || !req.body.xml || !req.body.sessionId) {
    res.status(400).send({
      message: "Missing application data to send to Uniform"
    });
  }

  // TODO create some type of lookup between req.params.localAuthority & Uniform-compatible organisations/organisationIds
  //   defaults to "DLUHC" for testing now (more values supplied after idox install I guess?? we'll probably need to template env vars with org name suffix)
  const org = "DLUHC";
  const orgId = 185050;

  try {
    // Setup - Create the zip folder
    const zipPath = await createZip(req.body.xml, req.body.csv, req.body.files, req.body.sessionId);

    // Request 1/3 - Authenticate
    const credentials = await authenticate(org);
    
    // 2/3 - Create a submission
    if (credentials?.access_token) {
      const token = credentials.access_token;
      const idoxSubmissionId = await createSubmission(token, org, orgId, req.body.sessionId);
      
      // 3/3 - Attach the zip & create an audit entry
      if (idoxSubmissionId) {
        const attachmentAdded = await attachArchive(token, idoxSubmissionId, zipPath);
        if (attachmentAdded) {
          deleteFile(zipPath);
        }

        const submissionDetails = await retrieveSubmission(token, idoxSubmissionId);
        const application = await client.request(
          `
            mutation CreateUniformApplication(
              $idox_submission_id: String = "",
              $submission_reference: String = "",
              $destination: String = "",
              $response: jsonb = "",
            ) {
              insert_uniform_applications_one(object: {
                idox_submission_id: $idox_submission_id,
                submission_reference: $submission_reference,
                destination: $destination,
                response: $response,
              }) {
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
            submission_reference: req.body.sessionId,
            destination: req.params.localAuthority,
            response: submissionDetails,
          }
        );

        res.status(200).send({
          message: `Successfully created a Uniform submission`,
          zipAttached: attachmentAdded,
          application: application.insert_uniform_applications_one,
        });
      } else {
        res.status(403).send({
          message: `Authenticated to Uniform, but failed to create submission`,
        });
      }
    } else {
      res.status(401).send({
        message: `Failed to authenticate to Uniform`,
      });
    }
  } catch (error) {
    next({
      error,
      message: `Failed to send to Uniform. ${error}`,
    });
  }
};

/**
 * Creates a zip folder containing the documents required by Uniform
 * @param {any} jsonXml - a JSON representation of the XML schema, resulting file must be named "proposal.xml"
 * @param {any} csv - an array of objects representing our custom CSV format
 * @param {string[]} files - an array of the S3 URLs for any user-uploaded files
 * @param {string} sessionId 
 * @returns {Promise}
 */
function createZip(jsonXml, csv, files, sessionId) {
  // initiate an empty zip folder
  const zip = new AdmZip();

  return new Promise(async (resolve, reject) => {
    try {
      // make a tmp directory to avoid file name collisions if simultaneous applications
      let tmpDir = "";
      fs.mkdtemp(path.join(os.tmpdir(), sessionId), (err, folder) => {
        if (err) throw err;
        tmpDir = folder;
      });

      // download any user-uploaded files from S3 to the tmp directory, add them to the zip
      if (files) {
        files.forEach(async (file) => {
          let filePath = path.join(tmpDir, file.split("/").pop());
          await downloadFile(file, filePath, zip);
        });
      }

      // build a CSV, write it to the tmp directory, add it to the zip
      const csvPath = path.join(tmpDir, "application.csv");
      const csvFile = fs.createWriteStream(csvPath);
      const csvStream = stringify(csv, { columns: ["question", "responses", "metadata"], header: true }).pipe(csvFile);
      csvStream.on("finish", () => {
        zip.addLocalFile(csvPath);
        deleteFile(csvPath);
      });

      // build an XML file, add it directly to the zip
      const options = { compact: true, spaces: 4, fullTagEmptyElement: true };
      const xml = convert.json2xml(jsonXml, options);
      zip.addFile("proposal.xml", Buffer.from(xml, "utf-8"));

      // generate & save zip locally
      //   XXX using a timeout here to ensure various file streams have completed, need to make better??
      setTimeout(() => {
        const downloadName = `ripa-test-${sessionId}.zip`;
        zip.writeZip(downloadName);

        // cleanup tmp directory
        fs.rm(tmpDir, { recursive: true }, (err) => {
          if (err) throw err;
        });

        resolve(downloadName);
      }, 4000);
    } catch (err) {
      reject(err);
    }
  });
};

/**
 * Logs in to the Idox Submission API using a username/password
 *   and returns an access token
 * 
 * @param {string} organisation - idox-generated organisation name
 * @returns {Promise} - access token
 */
function authenticate(organisation) {
  const authEndpoint = "https://dev.identity.idoxgroup.com/uaa/oauth/token";

  const authOptions = {
    method: "POST",
    headers: new Headers({
      "Authorization": 'Basic ' + Buffer.from(process.env.UNIFORM_API_USERNAME + ":" + process.env.UNIFORM_API_PASSWORD).toString("base64"),
      "Content-type": "application/x-www-form-urlencoded",
    }),
    body: new URLSearchParams({
      client_id: process.env.UNIFORM_API_USERNAME,
      client_secret: process.env.UNIFORM_API_PASSWORD,
      grant_type: "client_credentials",
    }),
    redirect: "follow",
  };

  return new Promise(async (resolve, reject) => {
    try {
      await fetch(authEndpoint, authOptions)
        .then(response => resolve(response.json()));
    } catch (err) {
      reject(err);
    }
  });
};

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
function createSubmission(token, organisation, organisationId, sessionId = "TEST") {
  const createSubmissionEndpoint = "https://dev.identity.idoxgroup.com/agw/submission-api/secure/submission";

  const createSubmissionOptions = {
    method: "POST",
    headers: new Headers({
      "Authorization": `Bearer ${token}`,
      "Content-type": "application/json",
    }),
    body: JSON.stringify({
      "entity": "dc",
      "module": "dc",
      "organisation": organisation,
      "organisationId": organisationId,
      "submissionReference": sessionId,
      "description": "Test insert for DLUHC",
      "submissionProcessorType": "API"
    }),
    redirect: "follow",
  };

  return new Promise(async (resolve, reject) => {
    try {
      await fetch(createSubmissionEndpoint, createSubmissionOptions)
        .then(response => {
          // successful submission returns 201 Created without body
          if (response.status === 201) {
            // parse & return the submissionId
            const resourceLink = response.headers.get("location");
            resolve(resourceLink.split("/").pop());
          }
        });
    } catch (err) {
      reject(err);
    }
  });
};

/**
 * Uploads and attaches a zip folder to an existing submission
 * 
 * @param {string} token - access token retrieved from idox authentication 
 * @param {string} submissionId - idox-generated UUID returned in the resource link of the submission 
 * @param {string} zipPath - file path to an existing zip folder (2GB limit)
 * @returns {Promise}
 */
function attachArchive(token, submissionId, zipPath) {
  const attachArchiveEndpoint = `https://dev.identity.idoxgroup.com/agw/submission-api/secure/submission/${submissionId}/archive`;

  const formData = new FormData();
  formData.append("file", fs.createReadStream(zipPath));

  const attachArchiveOptions = {
    method: "POST",
    headers: new Headers({
      "Authorization": `Bearer ${token}`,
    }),
    body: formData,
    redirect: "follow",
  };

  return new Promise(async (resolve, reject) => {
    try {
      await fetch(attachArchiveEndpoint, attachArchiveOptions)
        .then(response => {
          // successful upload returns 204 No Content without body
          if (response.status === 204) {
            resolve(true);
          }
        });
    } catch (err) {
      reject(err);
    }
  });
};


/**
 * Gets details about an existing submission
 * 
 * @param {string} token - access token retrieved from idox authentication
 * @param {string} submissionId - idox-generated UUID returned in the resource link of the submission
 * @returns {Promise}
 */
function retrieveSubmission(token, submissionId) {
  const getSubmissionEndpoint = `https://dev.identity.idoxgroup.com/agw/submission-api/secure/submission/${submissionId}`;

  const getSubmissionOptions = {
    method: "GET",
    headers: new Headers({
      "Authorization": `Bearer ${token}`,
    }),
    redirect: "follow",
  };

  return new Promise(async (resolve, reject) => {
    try {
      await fetch(getSubmissionEndpoint, getSubmissionOptions)
        .then(response => resolve(response.json()));
    } catch (err) {
      reject(err);
    }
  });
};

/**
 * Helper method to locally download S3 files, add them to the zip, then clean them up
 * 
 * @param {string} url - s3 URL
 * @param {string} path - file name for download
 * @param {string} folder - AdmZip archive
 */
const downloadFile = async (url, path, folder) => {
  const res = await fetch(url);
  const fileStream = fs.createWriteStream(path);

  await new Promise((resolve, reject) => {
    res.body.pipe(fileStream);
    res.body.on("error", reject);

    fileStream.on("finish", () => {
      folder.addLocalFile(path);
      deleteFile(path);
      resolve;
    });
  });
};

/**
 * Helper method to clean up files temporarily stored locally
 * 
 * @param {string} path - file name
 */
const deleteFile = (path) => {
  if (fs.existsSync(path)) {
    fs.unlinkSync(path);
  } else {
    console.log(`Didn't find ${path}, nothing to delete`);
  }
};

module.exports = { sendToUniform };
