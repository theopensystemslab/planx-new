import type { GetObjectCommandOutput } from "@aws-sdk/client-s3";
import { Readable } from "stream";

import { getScanStatus } from "./scanStatus.js";
import { s3Factory } from "./utils.js";

const buildHeaders = (file: GetObjectCommandOutput) => ({
  "Content-Type": file.ContentType,
  "Content-Length": file.ContentLength,
  "Content-Disposition": file.ContentDisposition,
  "Content-Encoding": file.ContentEncoding,
  "Cache-Control": file.CacheControl,
  Expires: file.ExpiresString,
  "Last-Modified": file.LastModified,
  ETag: file.ETag,
  "cross-origin-resource-policy": "cross-site",
});

export type GetFileResult =
  | {
      outcome: "ok";
      body: Buffer;
      isPrivate: boolean;
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
 * S3 signals a missing object as `NoSuchKey` on GetObject and `NotFound` on HeadObject,
 * the latter without a usable message - fall back to the response status.
 */
const isNotFound = (error: unknown): boolean => {
  if (!(error instanceof Error)) return false;
  if (error.name === "NoSuchKey" || error.name === "NotFound") return true;

  const { $metadata } = error as { $metadata?: { httpStatusCode?: number } };
  return $metadata?.httpStatusCode === 404;
};
