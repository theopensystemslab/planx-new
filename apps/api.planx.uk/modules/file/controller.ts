import { getFileExtension, isAllowedExtension } from "@planx/file-upload";
import assert from "assert";
import { z } from "zod";

import { ServerError } from "../../errors/index.js";
import type { ValidatedRequestHandler } from "../../shared/middleware/validate.js";
import { deleteFilesByKey } from "./service/deleteFile.js";
import {
  getFileFromS3,
  type GetFileResult,
  headFileInS3,
  PUBLIC_FILE_CROSS_ORIGIN_RESOURCE_POLICY,
} from "./service/getFile.js";
import { uploadPrivateFile, uploadPublicFile } from "./service/uploadFile.js";
import { buildFilePath, safeDecode } from "./service/utils.js";

assert(process.env.AWS_S3_BUCKET);
assert(process.env.AWS_S3_REGION);
assert(process.env.AWS_ACCESS_KEY);
assert(process.env.AWS_SECRET_KEY);

interface UploadFileResponse {
  fileType: string | null;
  fileUrl: string;
}

export const uploadFileSchema = z.object({
  body: z.object({
    filename: z
      .string()
      .trim()
      .min(1)
      .refine(isAllowedExtension, (input) => ({
        message: `Unsupported file type for given filename: ${getFileExtension(input)}`,
      }))
      .transform((filename) => encodeURIComponent(filename)),
  }),
});

export type UploadController = ValidatedRequestHandler<
  typeof uploadFileSchema,
  UploadFileResponse
>;

export const privateUploadController: UploadController = async (
  req,
  res,
  next,
) => {
  try {
    if (!req.file) throw Error("Missing file");
    const { filename } = res.locals.parsedReq.body;
    const fileResponse = await uploadPrivateFile(req.file, filename);
    res.json(fileResponse);
  } catch (error) {
    return next(
      new ServerError({ message: `Failed to upload private file: ${error}` }),
    );
  }
};

export const publicUploadController: UploadController = async (
  req,
  res,
  next,
) => {
  try {
    if (!req.file) throw Error("Missing file");
    const { filename } = res.locals.parsedReq.body;
    const fileResponse = await uploadPublicFile(req.file, filename);
    res.json(fileResponse);
  } catch (error) {
    return next(
      new ServerError({
        message: `Failed to upload public file: ${(error as Error).message}`,
      }),
    );
  }
};

export const hostedFileSchema = z.object({
  params: z.object({
    fileKey: z.string(),
    fileName: z.string(),
  }),
});

export type DownloadController = ValidatedRequestHandler<
  typeof hostedFileSchema,
  Buffer | { error: string }
>;

type DownloadResponse = Parameters<DownloadController>[1];
type DownloadNext = Parameters<DownloadController>[2];

/** How long we ask a client to wait before retrying a file whose scan is still pending */
const SCAN_RETRY_AFTER_SECONDS = 30;

/**
 * Public files are worth caching. Team logos in particular are served on many pages,
 * and each uncached hit costs us a full S3 read into memory.
 *
 * Without this, browsers fall back to heuristic freshness based on `Last-Modified`.
 * See: https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching
 */
const PUBLIC_FILE_CACHE_CONTROL_SUCCESS = {
  "cache-control": "public, max-age=3600",
} as const;

/**
 * Note the public GET route has no useNoCache (unlike private), so we set this on error responses to
 * keep failures out of caches, e.g. a cached 503 would leave a file looking broken when it's servable.
 */
const PUBLIC_FILE_CACHE_CONTROL_SUCCESS_FAILURE = {
  "cache-control": "no-store",
} as const;

/**
 * Map a failed read of the user-data bucket onto an HTTP response.
 *
 * Request bodies should carry a stable code: councils and their integrations can branch on
 * these, and the human-readable detail (e.g. file key) belongs in our logs rather than on the wire.
 */
const handleFileError = (
  result: Exclude<GetFileResult, { outcome: "ok" }>,
  filePath: string,
  res: DownloadResponse,
  next: DownloadNext,
) => {
  res.set({
    ...PUBLIC_FILE_CROSS_ORIGIN_RESOURCE_POLICY,
    ...PUBLIC_FILE_CACHE_CONTROL_SUCCESS_FAILURE,
  });

  switch (result.outcome) {
    case "pending-scan":
      return res
        .status(503)
        .set("Retry-After", String(SCAN_RETRY_AFTER_SECONDS))
        .json({ error: "FILE_SCAN_PENDING" });
    case "malicious":
      return res.status(404).json({ error: "FILE_FLAGGED" });
    case "not-found":
      return res.status(404).json({ error: "FILE_NOT_FOUND" });
    case "error":
      return next(
        new ServerError({
          message: `Failed to download file ${filePath}`,
          cause: result.cause,
        }),
      );
  }
};

/**
 * Hand back the bytes, as a download rather than something the browser will render 'inline'.
 *
 * `res.attachment` does several jobs: it sets `Content-Disposition: attachment`, derives Content-Type
 * from the filename's extension (which we validated against actual content at upload), and sets the
 * Content-Disposition 'filename = ' parameter. Unknown extensions fall back to application/octet-stream.
 *
 * NB. This does not affect `<img src>` embeds: Content-Disposition applies to navigations/downloads, not subresource loads.
 */
const sendFile = (
  result: Extract<GetFileResult, { outcome: "ok" }>,
  res: DownloadResponse,
) => {
  // we decode first, or the browser saves the file under our own escaping (e.g. "my%20plan.pdf")
  // Express can re-encode as required,see: https://expressjs.com/en/4x/api/response/#resattachment
  res.attachment(safeDecode(result.filename));
  res.set(result.headers);
  return res.send(result.body);
};

export const publicDownloadController: DownloadController = async (
  _req,
  res,
  next,
) => {
  const { fileKey, fileName } = res.locals.parsedReq.params;
  const filePath = buildFilePath(fileKey, fileName);

  const result = await getFileFromS3(filePath);

  if (result.outcome !== "ok")
    return handleFileError(result, filePath, res, next);

  // public route should not reveal that a private file exists
  if (result.isPrivate)
    return res
      .status(404)
      .set({
        ...PUBLIC_FILE_CROSS_ORIGIN_RESOURCE_POLICY,
        ...PUBLIC_FILE_CACHE_CONTROL_SUCCESS_FAILURE,
      })
      .json({ error: "FILE_NOT_FOUND" });

  res.set(PUBLIC_FILE_CACHE_CONTROL_SUCCESS);
  return sendFile(result, res);
};

export const privateDownloadController: DownloadController = async (
  _req,
  res,
  next,
) => {
  const { fileKey, fileName } = res.locals.parsedReq.params;
  const filePath = buildFilePath(fileKey, fileName);

  const result = await getFileFromS3(filePath);

  if (result.outcome !== "ok")
    return handleFileError(result, filePath, res, next);

  return sendFile(result, res);
};

export type DeleteController = ValidatedRequestHandler<
  typeof hostedFileSchema,
  Record<string, never> | { error: string }
>;

export const publicDeleteController: DeleteController = async (
  _req,
  res,
  next,
) => {
  const { fileKey, fileName } = res.locals.parsedReq.params;
  const filePath = buildFilePath(fileKey, fileName);

  // Metadata-only read - should be able to delete a file regardless of scan status
  const file = await headFileInS3(filePath);

  if (file.outcome === "not-found")
    return res.status(404).json({ error: "FILE_NOT_FOUND" });

  if (file.outcome === "error")
    return next(
      new ServerError({
        message: `Failed to delete public file ${filePath}`,
        cause: file.cause,
      }),
    );

  if (file.isPrivate) return res.status(404).json({ error: "FILE_NOT_FOUND" });

  try {
    // once we've established that the file is public, we can delete it
    await deleteFilesByKey([filePath]);
    return res.status(204).send();
  } catch (error) {
    return next(
      new ServerError({ message: `Failed to delete public file: ${error}` }),
    );
  }
};
