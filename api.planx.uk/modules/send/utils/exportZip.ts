import os from "os";
import path from "path";
import { $api } from "../../../client";
import { stringify } from "csv-stringify";
import fs from "fs";
import str from "string-to-stream";
import AdmZip from "adm-zip";
import { getFileFromS3 } from "../../file/service/getFile";
import {
  hasRequiredDataForTemplate,
  generateMapHTML,
  generateApplicationHTML,
  generateDocxTemplateStream,
} from "@opensystemslab/planx-core";
import { Passport } from "@opensystemslab/planx-core";
import type { Passport as IPassport } from "../../../types";
import type { Stream } from "node:stream";
import type { PlanXExportData } from "@opensystemslab/planx-core/types";

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
  const sessionData = await $api.session.find(sessionId);
  if (!sessionData) {
    throw new Error(
      `session ${sessionId} not found so could not create Uniform submission zip`,
    );
  }
  const passport = sessionData.data?.passport as IPassport;

  // add OneApp XML to the zip
  if (includeOneAppXML) {
    try {
      const xml = await $api.export.oneAppPayload(sessionId);
      const xmlStream = str(xml.trim());
      await zip.addStream({
        name: "proposal.xml", // must be named "proposal.xml" to be processed by Uniform
        stream: xmlStream,
      });
    } catch (error) {
      throw Error(`Failed to generate OneApp XML. Error - ${error}`);
    }
  }

  // add remote files on S3 to the zip
  const files = new Passport(passport).files();
  if (files.length) {
    for (const fileURL of files) {
      // Ensure unique filename by combining original filename and S3 folder name, which is a nanoid
      // Uniform requires all uploaded files to be present in the zip, even if they are duplicates
      // Must match unique filename in editor.planx.uk/src/@planx/components/Send/uniform/xml.ts
      const uniqueFilename = decodeURIComponent(
        fileURL.split("/").slice(-2).join("-"),
      );
      await zip.addRemoteFile({ url: fileURL, name: uniqueFilename });
    }
  }

  // generate csv data
  const responses = await $api.export.csvData(sessionId);
  const redactedResponses = await $api.export.csvDataRedacted(sessionId);

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
    throw Error(`Failed to generate CSV. Error - ${error}`);
  }

  // add template files to zip
  const templateNames =
    await $api.getDocumentTemplateNamesForSession(sessionId);
  for (const templateName of templateNames || []) {
    try {
      const isTemplateSupported = hasRequiredDataForTemplate({
        passport,
        templateName,
      });
      if (isTemplateSupported) {
        const templateStream = generateDocxTemplateStream({
          passport,
          templateName,
        });
        await zip.addStream({
          name: `${templateName}.doc`,
          stream: templateStream,
        });
      }
    } catch (error) {
      console.log(
        `Template "${templateName}" could not be generated so has been skipped. Error - ${error}`,
      );
      continue;
    }
  }

  const boundingBox = passport.data["property.boundary.site.buffered"];
  const userAction = passport.data?.["drawBoundary.action"];
  // generate and add an HTML overview document for the submission to zip
  const overviewHTML = generateApplicationHTML({
    planXExportData: responses as PlanXExportData[],
    boundingBox,
    userAction,
  });
  await zip.addFile({
    name: "Overview.htm",
    buffer: Buffer.from(overviewHTML),
  });

  // generate and add an HTML overview document for the submission to zip
  const redactedOverviewHTML = generateApplicationHTML({
    planXExportData: redactedResponses as PlanXExportData[],
    boundingBox,
    userAction,
  });
  await zip.addFile({
    name: "RedactedOverview.htm",
    buffer: Buffer.from(redactedOverviewHTML),
  });

  // add an optional GeoJSON file to zip
  const geojson = passport?.data?.["property.boundary.site"];
  if (geojson) {
    geojson["properties"]["planx_user_action"] = userAction;
    const geoBuff = Buffer.from(JSON.stringify(geojson, null, 2));
    zip.addFile({
      name: "LocationPlanGeoJSON.geojson",
      buffer: geoBuff,
    });

    // generate and add an HTML boundary document for the submission to zip
    const boundaryHTML = generateMapHTML({
      geojson,
      boundingBox,
      userAction,
    });
    await zip.addFile({
      name: "LocationPlan.htm",
      buffer: Buffer.from(boundaryHTML),
    });
  }

  // write the zip
  zip.write();

  return zip;
}

// ExportZip is responsible for creating a zip including managing temporary files and directories
export class ExportZip {
  zip: AdmZip;
  filename: string;
  private tmpDir: string;

  constructor(sessionId: string) {
    this.zip = new AdmZip();
    // make a tmp directory to avoid file name collisions if simultaneous applications
    this.tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), sessionId));
    this.filename = path.join(__dirname, `ripa-test-${sessionId}.zip`);
  }

  addFile({ name, buffer }: { name: string; buffer: Buffer }) {
    this.zip.addFile(name, buffer);
  }

  async addStream({
    name,
    stream,
  }: {
    name: string;
    stream: { pipe: Stream["pipe"] };
  }): Promise<void> {
    const filePath = path.join(this.tmpDir, name);
    const writeStream = fs.createWriteStream(filePath);
    return resolveStream(stream.pipe(writeStream)).then(() => {
      this.zip.addLocalFile(filePath);
      fs.unlinkSync(filePath);
    });
  }

  async addRemoteFile({ name, url }: { name: string; url: string }) {
    // Files are stored decoded on S3, but encoded in our passport, ensure the key matches S3 before fetching it
    const s3Key = url.split("/").slice(-2).join("/");
    const decodedS3Key = decodeURIComponent(s3Key);
    const { body } = await getFileFromS3(decodedS3Key);
    if (!body) throw new Error("file not found");

    this.zip.addFile(name, body as Buffer);
  }

  toBuffer(): Buffer {
    return this.zip.toBuffer();
  }

  write() {
    this.zip.writeZip(this.filename);
    // clean-up tmp dir
    fs.rmSync(this.tmpDir, { recursive: true });
  }

  remove() {
    fs.unlinkSync(this.filename);
  }
}

async function resolveStream(stream: {
  on: (event: string, callback: (value: unknown) => void) => void;
}) {
  return await new Promise((resolve, reject) => {
    stream.on("error", reject);
    stream.on("finish", resolve);
  });
}
