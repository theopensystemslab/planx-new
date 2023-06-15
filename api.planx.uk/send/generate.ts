import fs from "fs";
import path from "path";
import AdmZip from "adm-zip";
import os from "os";
import { stringify } from "csv-stringify";
import {
  generateHTMLMapStream,
  generateHTMLOverviewStream,
} from "@opensystemslab/planx-document-templates";
import { addTemplateFilesToZip, deleteFile, resolveStream } from "./helpers";
import { $admin } from "../client";
import type { PlanXExportData } from "@opensystemslab/planx-document-templates/types/types";
import { Passport } from "@opensystemslab/planx-core";
import { downloadPassportFiles } from "./download";

export async function generateZip(sessionId: string) {
  // Fetch this lowcal_session's data
  const session = await $admin.session.find(sessionId);
  if (!session) {
    throw new Error(`Failed to find session data for session ${sessionId}`);
  }
  // Initiate an empty zip folder in memory
  const zip = new AdmZip();

  // Make a tmp directory to avoid file name collisions if simultaneous applications
  let tmpDir = "";
  fs.mkdtemp(path.join(os.tmpdir(), sessionId), (err, folder) => {
    if (err) throw err;
    tmpDir = folder;
  });

  // Build a csv file, write it locally, add it to the zip
  const csvData = await $admin.generateCSVData(sessionId);
  if (csvData) {
    const csvPath = path.join(tmpDir, "application.csv");
    const csvFile = fs.createWriteStream(csvPath);

    const csvStream = stringify(csvData, {
      columns: ["question", "responses", "metadata"],
      header: true,
    }).pipe(csvFile);
    await resolveStream(csvStream);
    zip.addLocalFile(csvPath);
    deleteFile(csvPath);
  }

  // If the user drew a red line boundary, add a geojson file
  const geojson = session.data.passport?.data?.["property.boundary.site"];
  if (geojson) {
    const geoBuff = Buffer.from(JSON.stringify(geojson, null, 2));
    zip.addFile("boundary.geojson", geoBuff);

    // generate and add an HTML boundary document
    const boundaryPath = path.join(tmpDir, "LocationPlan.html");
    const boundaryFile = fs.createWriteStream(boundaryPath);
    const boundaryStream = generateHTMLMapStream(geojson).pipe(boundaryFile);
    await resolveStream(boundaryStream);
    zip.addLocalFile(boundaryPath);
    deleteFile(boundaryPath);
  }

  // As long as we csv data, add a HTML overview document for human-readability
  if (csvData) {
    const htmlPath = path.join(tmpDir, "application.html");
    const htmlFile = fs.createWriteStream(htmlPath);
    const htmlStream = generateHTMLOverviewStream(
      csvData as PlanXExportData[]
    ).pipe(htmlFile);
    await resolveStream(htmlStream);
    zip.addLocalFile(htmlPath);
    deleteFile(htmlPath);
  }

  if (session.data.passport) {
    await addTemplateFilesToZip({
      zip,
      tmpDir,
      passport: { data: session.data.passport.data! },
      sessionId,
    });

    const passport = new Passport(session.data.passport);
    await downloadPassportFiles({ zip, tmpDir, passport });
  }

  // Generate and save the zip locally
  const zipName = `${sessionId}.zip`;
  zip.writeZip(zipName);
  return zipName;
}
