import AdmZip from "adm-zip";
import fs from "fs";
import { gql } from "graphql-request";
import path from "path";
import airbrake from "../airbrake";
import { getFileFromS3 } from "../s3/getFile";
import { adminGraphQLClient } from "../hasura";
import {
  hasRequiredDataForTemplate,
  generateDocxTemplateStream,
} from "@opensystemslab/planx-document-templates";
import { _admin } from "../client";
import { Passport } from "../types";

/**
 * Helper method to locally download S3 files, add them to the zip, then clean them up
 *
 * @param {string} url - our file URL, eg api.planx.uk/file/private/path/key
 * @param {string} path - file name for download
 * @param {AdmZip} folder - AdmZip archive
 */
export async function downloadFile(url: string, path: string, folder: AdmZip) {
  // Files are stored decoded on S3, but encoded in our passport, ensure the key matches S3 before fetching it
  const s3Key = url.split("/").slice(-2).join("/");
  const decodedS3Key = decodeURIComponent(s3Key);

  const { body }: any = await getFileFromS3(decodedS3Key);

  fs.writeFileSync(path, body);

  folder.addLocalFile(path);
  deleteFile(path);
}

/**
 * Helper method to clean up files temporarily stored locally
 *
 * @param {string} path - file name
 */
export function deleteFile(path: string) {
  if (fs.existsSync(path)) {
    fs.unlinkSync(path);
  } else {
    log(`Didn't find ${path}, nothing to delete`);
  }
}

export async function resolveStream(stream: {
  on: (event: string, callback: (value: unknown) => void) => void;
}) {
  return await new Promise((resolve, reject) => {
    stream.on("error", reject);
    stream.on("finish", resolve);
  });
}

export async function logPaymentStatus({
  sessionId,
  flowId,
  teamSlug,
  govUkResponse,
}: {
  sessionId: string | undefined;
  flowId: string | undefined;
  teamSlug: string;
  govUkResponse: {
    payment_id: string;
    state: {
      status: string;
    };
  };
}): Promise<void> {
  if (!flowId || !sessionId) {
    reportError({
      message:
        "Could not log the payment status due to missing context value(s)",
      context: { sessionId, flowId, teamSlug },
    });
  } else {
    // log payment status response
    try {
      await insertPaymentStatus({
        sessionId,
        flowId,
        teamSlug,
        paymentId: govUkResponse.payment_id,
        status: govUkResponse.state?.status || "unknown",
      });
    } catch (e) {
      reportError({
        message: "Failed to insert a payment status",
        error: e,
        govUkResponse,
      });
    }
  }
}

// tmp explicit error handling
function reportError(obj: object) {
  if (airbrake) {
    airbrake.notify(obj);
    return;
  }
  log(obj);
}

// tmp logger
function log(event: object | string) {
  if (!process.env.SUPPRESS_LOGS) {
    console.log(event);
  }
}

// TODO: this would ideally live in planx-client
async function insertPaymentStatus({
  flowId,
  sessionId,
  paymentId,
  teamSlug,
  status,
}: {
  flowId: string;
  sessionId: string;
  paymentId: string;
  teamSlug: string;
  status: string;
}): Promise<void> {
  const response = await adminGraphQLClient.request(
    gql`
      mutation InsertPaymentStatus(
        $flowId: uuid!
        $sessionId: uuid!
        $paymentId: String!
        $teamSlug: String!
        $status: payment_status_enum_enum
      ) {
        insert_payment_status(
          objects: {
            flow_id: $flowId
            session_id: $sessionId
            payment_id: $paymentId
            team_slug: $teamSlug
            status: $status
          }
        ) {
          affected_rows
        }
      }
    `,
    {
      flowId,
      sessionId,
      teamSlug,
      paymentId,
      status,
    }
  );
  console.log(response);
}

export const addTemplateFilesToZip = async ({
  zip,
  tmpDir,
  passport,
  sessionId,
}: {
  zip: AdmZip;
  tmpDir: string;
  passport: Passport;
  sessionId: string;
}) => {
  const templateNames = await _admin.getDocumentTemplateNamesForSession(
    sessionId
  );
  if (templateNames?.length) {
    for (const templateName of templateNames) {
      let isTemplateSupported = false;
      try {
        isTemplateSupported = hasRequiredDataForTemplate({
          passport,
          templateName,
        });
      } catch (e) {
        console.log(
          `Template "${templateName}" could not be generated so has been skipped`
        );
        console.log(e);
        continue;
      }
      if (isTemplateSupported) {
        const templatePath = path.join(tmpDir, `${templateName}.doc`);
        const templateFile = fs.createWriteStream(templatePath);
        const templateStream = generateDocxTemplateStream({
          passport,
          templateName,
        }).pipe(templateFile);
        await resolveStream(templateStream);
        zip.addLocalFile(templatePath);
        deleteFile(templatePath);
      }
    }
  }
};
