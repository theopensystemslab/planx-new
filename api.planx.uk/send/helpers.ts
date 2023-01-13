import AdmZip from "adm-zip";
import fs from "fs";
import type { Passport } from "./UniformPayload/types";

import airbrake from "../airbrake";
import { getFileFromS3 } from "../s3/getFile";
import { adminGraphQLClient } from "../hasura";
import { gql } from "graphql-request";

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
    console.log(`Didn't find ${path}, nothing to delete`);
  }
}

// TODO: business logic like this should ultimately live in planx-client
export function findGeoJSON(
  passport: Passport
): { type: "Feature" } | undefined {
  return passport.data["property.boundary.site"];
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
  console.log(obj);
}

// TODO: this would ideally live in planx-clint
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
  await adminGraphQLClient.request(
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
}
