const convert = require("xml-js");
const fs = require("fs");
const AdmZip = require("adm-zip");
const stringify = require("csv-stringify");
const { markSessionAsSubmitted } = require("./saveAndReturn/utils");

// Generate a .zip folder containing an XML (schema specified by Uniform), CSV (our own format) and any user uploaded files
//   Eventually, drop the .zip on an FTP server corresponding to that council's Uniform/IDOX instance so it can be picked up & parsed later
const sendToUniform = (req, res, next) => {
  if (!req.body) {
    res.send({
      message: "Missing application data to send to Uniform"
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

    // Mark session as submitted so that reminder and expiry emails are not triggered
    markSessionAsSubmitted(req.body.sessionId);
  } catch (err) {
    next(err);
  }
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

module.exports = { sendToUniform, downloadUniformZip };
