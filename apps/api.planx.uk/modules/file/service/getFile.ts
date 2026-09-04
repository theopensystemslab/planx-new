import type { GetObjectCommandOutput } from "@aws-sdk/client-s3";
import { NoSuchKey, NotFound, S3ServiceException } from "@aws-sdk/client-s3";
import { Readable } from "stream";

import { getScanStatus } from "./scanStatus.js";
import { s3Factory } from "./utils.js";

/**
 * Headers we are willing to pass on from S3, plus additional protections.
 *
 * Deliberately does *not* include Content-Type or Content-Disposition. Callers to getFile set both via
 * `res.attachment(filename)` instead, deriving the type from the extension we validated at upload time.
 *
 * We also don't echo Cache-Control or Expires to avoid overruling our useNoCache middleware.
 */
const buildHeaders = (file: GetObjectCommandOutput) => {
  const headers: Record<string, string> = {
    // allows the editor to load public-bucket images cross-origin
    "cross-origin-resource-policy": "cross-site",
    // our Content-Type is authoritative - never let a browser sniff its way past it
    "X-Content-Type-Options": "nosniff",
  };

  if (file.ETag) headers["ETag"] = file.ETag;
  // an HTTP-date must be RFC7231-safe: https://www.rfc-editor.org/info/rfc7231/#section-7.1.1.1
  if (file.LastModified)
    headers["Last-Modified"] = file.LastModified.toUTCString();

  return headers;
};

/**
 * S3 keys are `<nanoid>/<filename>`, so the name to serve under is the last segment.
 *
 * Falls back to a generic name without extension, so that `res.attachment`
 * determines Content-Type as application/octet-stream, which is the safe default.
 */
const filenameFromKey = (fileId: string): string =>
  fileId.split("/").filter(Boolean).pop() || "download";

export type GetFileResult =
  | {
      outcome: "ok";
      body: Buffer;
      isPrivate: boolean;
      /** Name to serve the file as - drives both Content-Disposition and Content-Type */
      filename: string;
      headers: ReturnType<typeof buildHeaders>;
    }
  | { outcome: "pending-scan" }
  | { outcome: "malicious"; findings: string }
  | { outcome: "not-found" }
  | { outcome: "error"; cause: unknown };

/**
 * Fetch a file from the user-data bucket, refusing to hand back bytes unless it's been scanned.
 * This is the only place object bytes are read from that bucket - the submission zip builder
 * resolves S3 keys straight from passport URLs and never passes through Express.
 */
export const getFileFromS3 = async (fileId: string): Promise<GetFileResult> => {
  const s3 = s3Factory();

  try {
    const file = await s3.getObject({
      Key: fileId,
      Bucket: process.env.AWS_S3_BUCKET,
    });

    if (!file.Body) throw Error(`Missing body from S3 file ${fileId}`);

    // decide before touching the stream, so unscanned bytes never reach memory
    const scan = await getScanStatus(s3, fileId, file);

    if (scan.status !== "clean") {
      discardBody(file);

      if (scan.status === "pending") {
        console.error(
          `Refusing to serve file ${fileId}: it has not yet been scanned`,
        );
        return { outcome: "pending-scan" };
      }

      console.error(
        `Refusing to serve file ${fileId}: Scanii returned findings "${scan.findings}"`,
      );
      return { outcome: "malicious", findings: scan.findings };
    }

    const body = Buffer.from(await file.Body.transformToByteArray());

    return {
      outcome: "ok",
      body,
      isPrivate: file.Metadata?.is_private === "true",
      filename: filenameFromKey(fileId),
      headers: buildHeaders(file),
    };
  } catch (error) {
    if (isNotFound(error)) {
      console.error(
        `File with key ${fileId} is not in S3. It may have been deleted by our content filtering system.`,
      );
      return { outcome: "not-found" };
    }

    console.error(
      `Unable to download file with key ${fileId} from S3. S3 error: ${error}`,
    );
    return { outcome: "error", cause: error };
  }
};

export type HeadFileResult =
  | { outcome: "ok"; isPrivate: boolean }
  | { outcome: "not-found" }
  | { outcome: "error"; cause: unknown };

/**
 * Check an object exists and read metadata, without pulling bytes or verifying scan status
 */
export const headFileInS3 = async (fileId: string): Promise<HeadFileResult> => {
  const s3 = s3Factory();

  try {
    const file = await s3.headObject({
      Key: fileId,
      Bucket: process.env.AWS_S3_BUCKET,
    });

    return { outcome: "ok", isPrivate: file.Metadata?.is_private === "true" };
  } catch (error) {
    if (isNotFound(error)) return { outcome: "not-found" };

    console.error(
      `Unable to read metadata for file with key ${fileId} from S3. S3 error: ${error}`,
    );
    return { outcome: "error", cause: error };
  }
};

/** Release the underlying connection for a body that might be unsafe to read */
const discardBody = (file: GetObjectCommandOutput) => {
  if (file.Body instanceof Readable) file.Body.destroy();
};

/**
 * S3 signals a missing object as `NoSuchKey` on GetObject and `NotFound` on HeadObject.
 * Any other unmodelled shape carrying a 404 counts too - `$metadata` is on the shared
 * `S3ServiceException` base, so the response status is available without casting.
 */
const isNotFound = (error: unknown): boolean => {
  if (error instanceof NoSuchKey || error instanceof NotFound) return true;
  if (error instanceof S3ServiceException)
    return error.$metadata.httpStatusCode === 404;

  return false;
};
