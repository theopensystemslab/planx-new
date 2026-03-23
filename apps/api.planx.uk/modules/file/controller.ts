import assert from "assert";
import { deleteFilesByKey } from "./service/deleteFile.js";
import { uploadPrivateFile, uploadPublicFile } from "./service/uploadFile.js";
import { buildFilePath } from "./service/utils.js";
import { getFileFromS3 } from "./service/getFile.js";
import { z } from "zod";
import type { ValidatedRequestHandler } from "../../shared/middleware/validate.js";
import { ServerError } from "../../errors/index.js";
import { validateExtension } from "./middleware/useFileUpload.js";
import path from "path";

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
      .refine(validateExtension, (input) => ({
        message: `Unsupported file type: ${path.extname(input).toLowerCase()}`,
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

export const publicDownloadController: DownloadController = async (
  _req,
  res,
  next,
) => {
  const { fileKey, fileName } = res.locals.parsedReq.params;
  const filePath = buildFilePath(fileKey, fileName);

  try {
    const file = await getFileFromS3(filePath);
    if (!file) {
      return res.status(404).json({
        error: `Missing file - this file has been deleted by our automated content filtering system. Please contact PlanX for further details quoting file ID ${filePath}`,
      });
    }

    const { body, headers, isPrivate } = file;

    if (isPrivate) throw Error("Bad request");

    res.set(headers);
    res.send(body);
  } catch (error) {
    return next(
      new ServerError({ message: `Failed to download public file: ${error}` }),
    );
  }
};

export const privateDownloadController: DownloadController = async (
  _req,
  res,
  next,
) => {
  const { fileKey, fileName } = res.locals.parsedReq.params;
  const filePath = buildFilePath(fileKey, fileName);

  try {
    const file = await getFileFromS3(filePath);
    if (!file) {
      return res.status(404).json({
        error: `Missing file - this file has been deleted by our automated content filtering system. Please contact PlanX for further details quoting file ID ${filePath}`,
      });
    }

    res.set(file.headers);
    res.send(file.body);
  } catch (error) {
    return next(
      new ServerError({ message: `Failed to download private file: ${error}` }),
    );
  }
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

  try {
    const file = await getFileFromS3(filePath);
    if (!file) {
      return res.status(404).json({
        error: `Missing file - this file has been deleted by our automated content filtering system. Please contact PlanX for further details quoting file ID ${filePath}`,
      });
    }

    if (file.isPrivate) throw Error("Bad request");

    // once we've established that the file is public, we can delete it
    await deleteFilesByKey([filePath]);
    res.status(204).send();
  } catch (error) {
    return next(
      new ServerError({ message: `Failed to delete public file: ${error}` }),
    );
  }
};
