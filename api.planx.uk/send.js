require("isomorphic-fetch");
const os = require("os");
const path = require("path");
const FormData = require("form-data");
const fs = require("fs");
const AdmZip = require("adm-zip");
const str = require("string-to-stream");
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

  try {
    const { clientId, clientSecret } = getUniformClient(req.params.localAuthority);
    // Setup - Create the zip folder
    const zipPath = await createZip(req.body.xml, req.body.csv, req.body.files, req.body.sessionId);

    // Request 1/3 - Authenticate
    const { 
      access_token: token, 
      "organisation-name": organisation, 
      "organisation-id": organisationId 
    } = await authenticate(clientId, clientSecret);
    
    // 2/3 - Create a submission
    if (token) {
      const idoxSubmissionId = await createSubmission(token, organisation, organisationId, req.body.sessionId);
      
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
 * @param {any} stringXml - a string representation of the XML schema, resulting file must be named "proposal.xml"
 * @param {any} csv - an array of objects representing our custom CSV format
 * @param {string[]} files - an array of the S3 URLs for any user-uploaded files
 * @param {string} sessionId
 * @returns {Promise} - name of zip
 */
async function createZip(stringXml, csv, files, sessionId) {
  // initiate an empty zip folder
  const zip = new AdmZip();

  // make a tmp directory to avoid file name collisions if simultaneous applications
  let tmpDir = "";
  fs.mkdtemp(path.join(os.tmpdir(), sessionId), (err, folder) => {
    if (err) throw err;
    tmpDir = folder;
  });

  try {
    // download any user-uploaded files from S3 to the tmp directory, add them to the zip
    if (files) {
      for (let file of files) {
        const filePath = path.join(tmpDir, file.split("/").pop());
        await downloadFile(file, filePath, zip);
      }
    }

    // build a CSV, write it to the tmp directory, add it to the zip
    const csvPath = path.join(tmpDir, "application.csv");
    const csvFile = fs.createWriteStream(csvPath);
    
    const csvStream = stringify(csv, { columns: ["question", "responses", "metadata"], header: true }).pipe(csvFile);
    await new Promise((resolve, reject) => {
      csvStream.on("error", reject);
      csvStream.on("finish", resolve);
    });

    zip.addLocalFile(csvPath);
    deleteFile(csvPath);

    // build the XML file from a string, write it locally, add it to the zip
    //   must be named "proposal.xml" to be processed by Uniform
    const xmlPath = "proposal.xml";
    const xmlFile = fs.createWriteStream(xmlPath);
    
    const xmlStream = str(stringXml.trim()).pipe(xmlFile);
    await new Promise((resolve, reject) => {
      xmlStream.on("error", reject);
      xmlStream.on("finish", resolve);
    });

    zip.addLocalFile(xmlPath);
    deleteFile(xmlPath);
    
    // generate & save zip locally
    const zipName = `ripa-test-${sessionId}.zip`;
    zip.writeZip(zipName);

    // cleanup tmp directory
    fs.rm(tmpDir, { recursive: true }, (err) => {
      if (err) throw err;
    });

    return zipName;
  } catch (err) {
    throw err;
  }
};

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
      "Authorization": 'Basic ' + Buffer.from(clientId + ":" + clientSecret).toString("base64"),
      "Content-type": "application/x-www-form-urlencoded",
    }),
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "client_credentials",
    }),
    redirect: "follow",
  };

  try {
    return await fetch(authEndpoint, authOptions)
      .then(response => response.json());
  } catch (err) {
    throw err;
  }
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
async function createSubmission(token, organisation, organisationId, sessionId = "TEST") {
  const createSubmissionEndpoint = process.env.UNIFORM_SUBMISSION_URL + "/secure/submission"

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

  try {
    return await fetch(createSubmissionEndpoint, createSubmissionOptions)
      .then(response => {
        // successful submission returns 201 Created without body
        if (response.status === 201) {
          // parse & return the submissionId
          const resourceLink = response.headers.get("location");
          return resourceLink.split("/").pop();
        }
      });
  } catch (err) {
    throw err;
  }
};

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
    console.log(`Zip does not exist, cannot attach to idox_submission_id ${submissionId}`);
    return false;
  }

  const attachArchiveEndpoint = process.env.UNIFORM_SUBMISSION_URL + `/secure/submission/${submissionId}/archive`;

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
  
  try {
    return await fetch(attachArchiveEndpoint, attachArchiveOptions)
      .then(response => {
        // successful upload returns 204 No Content without body
        if (response.status === 204) {
          return true;
        }
      });
  } catch (err) {
    throw err;
  }
};


/**
 * Gets details about an existing submission to store for auditing purposes
 *   since neither createSubmission nor attachArchive requests return a meaningful response body
 * 
 * @param {string} token - access token retrieved from idox authentication
 * @param {string} submissionId - idox-generated UUID returned in the resource link of the submission
 * @returns {Promise}
 */
async function retrieveSubmission(token, submissionId) {
  const getSubmissionEndpoint = process.env.UNIFORM_SUBMISSION_URL + `/secure/submission/${submissionId}`

  const getSubmissionOptions = {
    method: "GET",
    headers: new Headers({
      "Authorization": `Bearer ${token}`,
    }),
    redirect: "follow",
  };

  try {
    return await fetch(getSubmissionEndpoint, getSubmissionOptions)
      .then(response => response.json());
  } catch (err) {
    throw err;
  }
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

  res.body.pipe(fileStream);
  await new Promise((resolve, reject) => {
    fileStream.on("error", reject);
    fileStream.on("finish", resolve);
  });

  folder.addLocalFile(path);
  deleteFile(path);
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

/**
 * Get id and secret of Uniform client which matches the provided Local Authority
 * @param {string} localAuthority 
 * @returns {object}
 */
const getUniformClient = (localAuthority) => {
  // Greedily match any non-word characters
  // XXX: Matches regex used in IAC (getCustomerSecrets.ts)
  const regex = new RegExp(/\W+/g)
  const client = process.env["UNIFORM_CLIENT_" + localAuthority.replace(regex, "_").toUpperCase()];
  if (!client) throw Error("Unable to find Uniform client credentials");
  const [ clientId, clientSecret ] = client.split(":");
  return { clientId, clientSecret };
};

module.exports = { sendToUniform };
