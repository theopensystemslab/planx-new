import os from "os";
import path from "path";
import { $admin } from "../client";
import { stringify } from "csv-stringify";
import fs from "fs";
import str from "string-to-stream";
import AdmZip from "adm-zip";
import { deleteFile, resolveStream } from "./helpers";
import { getFileFromS3 } from "../s3/getFile";
import {
  hasRequiredDataForTemplate,
  generateHTMLMapStream,
  generateHTMLOverviewStream,
  generateDocxTemplateStream,
} from "@opensystemslab/planx-document-templates";
import { Passport } from "@opensystemslab/planx-core";
import { Passport as IPassport } from "../types";
import type { Stream } from "node:stream";
import type { PlanXExportData } from "@opensystemslab/planx-document-templates/types/types";

export async function buildSubmissionExportZip({
  sessionId,
  includeOneAppXML = false,
}: {
  sessionId: string;
  includeOneAppXML?: boolean;
}): Promise<ExportZip> {
  // create zip
  const zip = new ExportZip(sessionId);

  // fetch session data
  const sessionData = await $admin.session.find(sessionId);
  if (!sessionData) {
    throw new Error(
      `session ${sessionId} not found so could not create Uniform submission zip`
    );
  }
  const passport = sessionData.data?.passport as IPassport;

  // add OneApp XML to the zip
  if (includeOneAppXML) {
    try {
      const xml = await $admin.generateOneAppXML(sessionId);
      const xmlStream = str(xml.trim());
      zip.addStream({
        name: "proposal.xml", // must be named "proposal.xml" to be processed by Uniform
        stream: xmlStream,
      });
    } catch (error) {
      throw Error(`Failed to generate OneApp XML. Error - ${error}`);
    }
  }

  // add remote files on S3 to the zip
  const files = new Passport(passport).getFiles();
  if (files.length) {
    for (const fileURL of files) {
      // Ensure unique filename by combining original filename and S3 folder name, which is a nanoid
      // Uniform requires all uploaded files to be present in the zip, even if they are duplicates
      // Must match unique filename in editor.planx.uk/src/@planx/components/Send/uniform/xml.ts
      const uniqueFilename = decodeURIComponent(
        fileURL.split("/").slice(-2).join("-")
      );
      await zip.addRemoteFile({ url: fileURL, name: uniqueFilename });
    }
  }

  // generate csv data
  const { responses, redactedResponses } = await $admin.export.csvData(
    sessionId
  );

  // write csv to the zip
  try {
    const csvStream = stringify(responses, {
      columns: ["question", "responses", "metadata"],
      header: true,
    });
    await zip.addStream({
      name: "application.csv",
      stream: csvStream,
    });
  } catch (error) {
    console.log(error);
    throw Error(`Failed to generate CSV. Error - ${error}`);
  }

  // add template files to zip
  const templateNames = await $admin.getDocumentTemplateNamesForSession(
    sessionId
  );
  for (const templateName of templateNames || []) {
    let isTemplateSupported = false;
    try {
      isTemplateSupported = hasRequiredDataForTemplate({
        passport,
        templateName,
      });
    } catch (error) {
      console.log(
        `Template "${templateName}" could not be generated so has been skipped. Error - ${error}`
      );
      continue;
    }
    if (isTemplateSupported) {
      const templateStream = generateDocxTemplateStream({
        passport,
        templateName,
      });
      zip.addStream({
        name: `${templateName}.doc`,
        stream: templateStream,
      });
    }
  }

  // generate and add an HTML overview document for the submission to zip
  const overviewStream = generateHTMLOverviewStream(
    responses as PlanXExportData[]
  );
  await zip.addStream({
    name: "Overview.htm",
    stream: overviewStream,
  });

  // generate and add an HTML overview document for the submission to zip
  const redactedOverviewStream = generateHTMLOverviewStream(
    redactedResponses as PlanXExportData[]
  );
  await zip.addStream({
    name: "RedactedOverview.htm",
    stream: redactedOverviewStream,
  });

  // add an optional GeoJSON file to zip
  const geojson = passport?.data?.["property.boundary.site"];
  if (geojson) {
    const geoBuff = Buffer.from(JSON.stringify(geojson, null, 2));
    zip.addFile({
      name: "LocationPlanGeoJSON.geojson",
      buffer: geoBuff,
    });

    // generate and add an HTML boundary document for the submission to zip
    const boundaryStream = generateHTMLMapStream(geojson);
    await zip.addStream({
      name: "LocationPlan.htm",
      stream: boundaryStream,
    });
  }

  // write the zip (and clean up tmp dir)
  zip.write();

  return zip;
}

// ExportZip is responsible for creating a zip including managing temporary files and directories
export class ExportZip {
  zip: AdmZip;
  zipName: string;
  private tmpDir: string;

  constructor(sessionId: string) {
    this.zip = new AdmZip();
    // make a tmp directory to avoid file name collisions if simultaneous applications
    this.tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), sessionId));
    this.zipName = `ripa-test-${sessionId}.zip`;
  }

  async addFile({ name, buffer }: { name: string; buffer: Buffer }) {
    const filePath = path.join(this.tmpDir, name);
    this.zip.addFile(filePath, buffer);
  }

  async addStream({ name, stream }: { name: string; stream: Stream }) {
    const filePath = path.join(this.tmpDir, name);
    const writeStream = fs.createWriteStream(filePath);
    await resolveStream(stream.pipe(writeStream));
    this.zip.addLocalFile(filePath);
    deleteFile(filePath);
  }

  async addRemoteFile({ name, url }: { name: string; url: string }) {
    // Files are stored decoded on S3, but encoded in our passport, ensure the key matches S3 before fetching it
    const s3Key = url.split("/").slice(-2).join("/");
    const decodedS3Key = decodeURIComponent(s3Key);
    const { body } = await getFileFromS3(decodedS3Key);
    if (!body) {
      throw new Error("file not found");
    }
    const filePath = path.join(this.tmpDir, name);
    fs.writeFileSync(filePath, body as Buffer);
    this.zip.addLocalFile(filePath);
    deleteFile(filePath);
  }

  toBuffer(): Buffer {
    return this.zip.toBuffer();
  }

  write() {
    this.zip.writeZip(this.zipName);
    // cleanup tmp directory
    fs.rmSync(this.tmpDir, { recursive: true });
  }
}
