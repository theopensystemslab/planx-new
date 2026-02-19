import {
  generateApplicationHTML,
  generateMapAndLabelHTML,
  generateMapHTML,
  Passport,
} from "@opensystemslab/planx-core";
import type { PlanXExportData } from "@opensystemslab/planx-core/types";
import AdmZip from "adm-zip";
import fs from "fs";
import type { Stream } from "node:stream";
import os from "os";
import path from "path";
import sanitize from "sanitize-filename";
import str from "string-to-stream";

import { $api } from "../../../client/index.js";
import type { Passport as IPassport } from "../../../types.js";
import { getFileFromS3 } from "../../file/service/getFile.js";
import { isApplicationTypeSupported } from "./helpers.js";
import { logDuration } from "../../../lib/performance.js";

export async function buildSubmissionExportZip({
  sessionId,
  includeOneAppXML = false,
  includeDigitalPlanningJSON = false,
  onlyDigitalPlanningJSON = false,
}: {
  sessionId: string;
  includeOneAppXML?: boolean;
  includeDigitalPlanningJSON?: boolean;
  onlyDigitalPlanningJSON?: boolean;
}): Promise<ExportZip> {
  // fetch session data
  const sessionData = await logDuration(`findSession-${sessionId}`, () =>
    $api.session.find(sessionId),
  );
  if (!sessionData) {
    throw new Error(
      `session ${sessionId} not found so could not create submission zip`,
    );
  }
  const passport = sessionData.data?.passport as IPassport;
  const breadcrumbs = sessionData.data?.breadcrumbs;
  const flowSlug = sessionData.flow.slug;

  // create empty zip
  const zip = new ExportZip(sessionId, flowSlug);

  // check to see whether we should validate JSON
  const doValidation = isApplicationTypeSupported(passport);

  const schema = await logDuration(
    `digitalPlanningDataPayload-${sessionId}`,
    () =>
      doValidation
        ? $api.export.digitalPlanningDataPayload(sessionId)
        : $api.export.digitalPlanningDataPayload(sessionId, true),
  );

  // add ODP Schema JSON to the zip, skipping validation if an unsupported application type
  if (includeDigitalPlanningJSON || onlyDigitalPlanningJSON) {
    try {
      const schemaBuff = Buffer.from(JSON.stringify(schema, null, 2));

      zip.addFile({
        name: "application.json",
        buffer: schemaBuff,
      });

      // return early if onlyDigitalPlanningJSON
      if (onlyDigitalPlanningJSON) {
        zip.write();
        return zip;
      }
    } catch (error) {
      throw new Error(
        `Failed to add ODP Schema JSON to zip for ${sessionId} zip. Error - ${error}`,
      );
    }
  }

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
      throw new Error(
        `Failed to generate OneApp XML for ${sessionId} zip. Error - ${error}`,
      );
    }
  }

  // add remote user-uploaded files on S3 to the zip
  const files = new Passport(passport).files;
  if (files.length) {
    await logDuration(
      `downloadS3Files-${sessionId}-count-${files.length}`,
      async () => {
        await Promise.all(
          files.map(async (file) => {
            // Ensure unique filename by combining original filename and S3 folder name, which is a nanoid
            // Uniform requires all uploaded files to be present in the zip, even if they are duplicates
            // Must match unique filename in apps/editor.planx.uk/src/@planx/components/Send/uniform/xml.ts
            const uniqueFilename = decodeURIComponent(
              file.url.split("/").slice(-2).join("-"),
            );
            await zip.addRemoteFile({ url: file.url, name: uniqueFilename });
          }),
        );
      },
    );
  }

  // generate and add an HTML overview document for the submission to zip
  await logDuration(`generateHTML-${sessionId}`, async () => {
    const boundingBox = passport.data["proposal.site.buffered"];
    const userAction = passport.data?.["drawBoundary.action"];

    const overviewHTML = injectCopyButtonScript(
      generateApplicationHTML({
        planXExportData: schema as PlanXExportData[],
        boundingBox,
        userAction,
      }),
    );
    zip.addFile({ name: "Overview.htm", buffer: Buffer.from(overviewHTML) });

    // add an optional GeoJSON file to zip
    const geojson = passport?.data?.["proposal.site"];
    if (geojson) {
      if (userAction) {
        geojson["properties"] ??= {};
        geojson["properties"]["planx_user_action"] = userAction;
      }
      const geoBuff = Buffer.from(JSON.stringify(geojson, null, 2));
      zip.addFile({
        name: "LocationPlanGeoJSON.geojson",
        buffer: geoBuff,
      });

      const boundaryHTML = generateMapHTML({
        geojson,
        boundingBox,
        userAction,
      });
      zip.addFile({
        name: "LocationPlan.htm",
        buffer: Buffer.from(boundaryHTML),
      });
    }
  });

  // If MapAndLabel(s), then add GeoJSON and HTML boundary files to zip for each
  await logDuration(`generateMapAndLabelHTML-${sessionId}`, async () => {
    const mapAndLabelNodes = passport?.data?.["_mapAndLabelVisitedNodes"];
    if (mapAndLabelNodes && mapAndLabelNodes?.length > 0) {
      mapAndLabelNodes.forEach((nodeId: string) => {
        const breadcrumbData: any =
          breadcrumbs[nodeId]?.data?.["_mapAndLabelNodeData"];
        const fn = breadcrumbData?.["fn"] as string;
        const schemaName = breadcrumbData?.["schemaName"] as string;

        const geojson = passport?.data?.[fn];
        if (geojson && schemaName) {
          const geoBuff = Buffer.from(JSON.stringify(geojson, null, 2));
          zip.addFile({
            name: `${schemaName}.geojson`,
            buffer: geoBuff,
          });

          const mapAndLabelHTML = generateMapAndLabelHTML({
            geojson: geojson,
            boundingBox: breadcrumbData?.["boundaryBBox"],
            drawColor: breadcrumbData?.["drawColor"],
            schemaFieldValues: breadcrumbData?.["schema"]?.["fields"]?.map(
              (field: any) => field.data?.fn,
            ),
            schemaName: schemaName,
          });
          zip.addFile({
            name: `${schemaName}.html`,
            buffer: Buffer.from(mapAndLabelHTML),
          });
        }
      });
    }
  });

  await logDuration(`writeDisk-Final-${sessionId}`, () => {
    zip.write();
    return Promise.resolve();
  });

  return zip;
}

// ExportZip is responsible for creating a zip including managing temporary files and directories
export class ExportZip {
  zip: AdmZip;
  filename: string;
  private tmpDir: string;

  constructor(sessionId: string, flowSlug: string) {
    this.zip = new AdmZip();
    // make a tmp directory to avoid file name collisions if simultaneous applications
    this.tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), sessionId));

    const sanitisedFilename = sanitize(`${flowSlug}-${sessionId}.zip`);
    this.filename = sanitisedFilename;
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
    const file = await getFileFromS3(decodedS3Key);

    if (file) this.zip.addFile(name, file.body);
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

export function injectCopyButtonScript(html: string): string {
  const copyButtonScript = `<script>
document.querySelectorAll('.copy-button').forEach(function(button) {
  button.addEventListener('click', function() {
    var value = this.getAttribute('data-copy-value');
    var span = this.querySelector('span');
    if (!value || !span) return;
    navigator.clipboard.writeText(value).then(function() {
      span.textContent = 'copied';
      setTimeout(function() { span.textContent = 'copy'; }, 1000);
    });
  });
});
</script>`;

  return html.replace("</body>", `${copyButtonScript}</body>`);
}
