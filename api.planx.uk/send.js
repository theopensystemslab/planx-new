require("isomorphic-fetch");
const FormData = require('form-data');
const convert = require("xml-js");
const fs = require("fs");
const AdmZip = require("adm-zip");
const stringify = require("csv-stringify");

// Generate a .zip folder containing an XML (schema specified by Uniform), CSV (our own format) and any user uploaded files
// TODO rename to `createUniformZip` ?? 
const sendToUniform = (req, res, next) => {
  if (!req.body) {
    res.send({
      message: "Missing application data to create Uniform zip"
    });
  }
  
  try {
    // initiate an empty zip folder
    const zip = new AdmZip();

    // download any user-uploaded files from S3 locally, add them to the zip
    const files = req.body.files;
    files.forEach((file) => {
      let filePath = file.split("/").pop();
      downloadFile(file, filePath, zip);
    });

    // build a CSV, write it locally, add it to the zip
    const csvPath = "test.csv";
    const csvFile = fs.createWriteStream(csvPath);
    const csvStream = stringify(req.body.csv, { columns: ["question", "responses", "metadata"], header: true }).pipe(csvFile);
    csvStream.on("finish", () => {
      zip.addLocalFile(csvPath);
      console.log(`Generated ${csvPath} and added to zip`);
      // cleanup
      deleteFile(csvPath);
    });

    // build an XML file, add it directly to the zip
    const options = { compact: true, spaces: 4, fullTagEmptyElement: true };
    const xml = convert.json2xml(req.body.xml, options);
    zip.addFile("test.xml", Buffer.from(xml, "utf-8"));
    console.log(`Generated test.xml and added to zip`);

    // generate & save zip locally (**for now while we wait for Uniform connection details**)
    //   XXX using a timeout here to ensure various file streams have completed, but probably better way??
    setTimeout(() => {
      const downloadName = "uniform_test.zip";
      zip.writeZip(downloadName);
      res.status(200).send({ message: "Generated zip", fileName: downloadName });
    }, 5000);
  } catch (err) {
    next(err);
  }
};

// Handle submission steps: authenticate, create a submission, and then attach the .zip to that submission
const sendToUniformNew = async (req, res, next) => {
  // TODO also check for !req.body.sessionId
  if (!req.params.localAuthority) {
    res.send({
      message: "Missing application data to submit to Uniform",
    });
  }

  // TODO create some type of lookup between req.params.localAuthority & Uniform-compatible organisations/organisationIds
  //   defaults to "DHLUC" for testing now (more values supplied after idox install I guess?? we'll probably need to template env vars with org name suffix)
  const org = "DHLUC";
  const orgId = 18505;

  try {
    // 1/3 - Authenticate
    const credentials = await authenticate(org);
    
    // 2/3 - Create a submission
    if (credentials && credentials.access_token) {
      const token = credentials.access_token;
      const idoxSubmissionId = await createSubmission(token, org, orgId, req.body.sessionId);
      
      // 3/3 - Attach the zip
      // TODO final request to GET endpoint to retrieve/store status and resource links in audit table??
      if (idoxSubmissionId) {
        const attachmentAdded = await attachArchive(token, idoxSubmissionId, "uniform_test.zip");
        if (attachmentAdded) {
          res.send({
            message: `Successfully created a submission and attached the zip`,
            submissionId: idoxSubmissionId,
          });
        } else {
          res.send({
            message: `Successfully created a submission, but failed to attach zip`,
            submissionId: idoxSubmissionId,
          });
        }
      } else {
        res.send({
          message: `Authenticated to Uniform, but failed to create submission`,
        });
      }
    } else {
      res.send({
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
      const resp = await fetch(authEndpoint, authOptions)
        .then(response => response.json())
        .catch(error => console.log(error));
      resolve(resp);
    } catch (err) {
      reject(err);
    }
  });
};

/**
 * Creates a submission (submissionReference must be unique value provided by RIPA & match XML <portaloneapp:RefNum>)
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
      const resp = await fetch(createSubmissionEndpoint, createSubmissionOptions)
        .then(response => {
          // successful submission returns 201 Created without body
          console.log(response.status);
          if (response.status === 201) {
            // parse & return the submissionId
            const resourceLink = response.headers.get("location");
            console.log(resourceLink);
            return resourceLink.split("/").pop();
          }
        })
        .catch(error => console.log(error));
      resolve(resp);
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
      const resp = await fetch(attachArchiveEndpoint, attachArchiveOptions)
        .then(response => {
          // successful upload returns 204 No Content without body
          if (response.status === 204) {
            return true;
          }
        })
        .catch(error => console.log(error));
      resolve(resp);
    } catch (err) {
      reject(err);
    }
  });
};

// XXX: TEMPORARY METHOD FOR TESTING ONLY
const downloadUniformZip = (req, res, next) => {
  try {
    const zipPath = req.query.file;
    if (fs.existsSync(zipPath)) {
      res.header('Content-type', 'application/zip');
      res.header('Content-Disposition', 'attachment');

      let stream = fs.createReadStream(zipPath);
      stream.pipe(res);
      res.attachment(zipPath);

      // TODO clean up local zip file
    } else {
      res.send({ message: "Couldn't find file to download" });
    }
  } catch (err) {
    next(err);
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

  await new Promise((resolve, reject) => {
    res.body.pipe(fileStream);
    res.body.on("error", reject);

    fileStream.on("finish", () => {
      folder.addLocalFile(path);
      console.log(`Downloaded ${path} and added to zip`);
      // cleanup
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
    console.log(`Deleted ${path}`);
  } else {
    console.log(`Didn't find ${path}, nothing to delete`);
  }
};

module.exports = { sendToUniform, sendToUniformNew, downloadUniformZip };
