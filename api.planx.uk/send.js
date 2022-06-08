require("isomorphic-fetch");
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
//   TODO store responses in uniform_applications table
const sendToUniformNew = async (req, res, next) => {
  // TODO additionally send & check for req.body.sessionId
  if (!req.params.localAuthority) {
    res.send({
      message: "Missing application data to submit to Uniform",
    });
  }

  // TODO map req.params.localAuthority to supported Uniform organisations/organisationIds (to be supplied by Idox)
  //   defaults to "DHLUC" for testing
  const org = "DHLUC";

  try {
    const credentials = await authenticate(org);
    if (credentials && credentials.access_token && credentials["organisation-id"]) {
      const token = credentials.access_token;
      const orgId = credentials["organisation-id"];

      const submissionLocation = await createSubmission(token, org, orgId, "TEST");
      const idoxSubmissionId = submissionLocation.split("/").pop();

      // TODO last request to add attachment, handle createSubmission errors

      res.send({
        message: `Authenticated and created a submission`,
        data: submissionLocation,
      });
    } else {
      res.send({
        message: `Unable to authenticate to Uniform`,
      });
    }
  } catch (error) {
    next({
      error,
      message: `Unable to send to Uniform. ${error}`,
    });
  }
};

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

function createSubmission(token, organisation, organisationId, sessionId) {
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
          if (response.status === 201) {
            return response.headers.get("location");
          }
        })
        .catch(error => console.log(error));
      resolve(resp);
    } catch (err) {
      reject(err);
    }
  });
};

function attachArchive(token, submissionId, zip) {
  console.log("TODO");
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

const deleteFile = (path) => {
  if (fs.existsSync(path)) {
    fs.unlinkSync(path);
    console.log(`Deleted ${path}`);
  } else {
    console.log(`Didn't find ${path}, nothing to delete`);
  }
};

module.exports = { sendToUniform, sendToUniformNew, downloadUniformZip };
