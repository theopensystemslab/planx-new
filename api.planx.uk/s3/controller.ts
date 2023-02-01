import assert from "assert";
import { uploadPrivateFile, uploadPublicFile } from "./uploadFile";
import { getFileFromS3 } from "./getFile";
import { NextFunction, Request, Response } from "express";
import { buildFilePath } from "./utils";

assert(process.env.AWS_S3_BUCKET);
assert(process.env.AWS_S3_REGION);
assert(process.env.AWS_ACCESS_KEY);
assert(process.env.AWS_SECRET_KEY);

export const privateUploadController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.body.filename)
    return next({ status: 422, message: "missing filename" });
  if (!req.file) return next({ status: 422, message: "missing file" });

  try {
    const fileResponse = await uploadPrivateFile(req.file, req.body.filename);

    res.json(fileResponse);
  } catch (err) {
    next(err);
  }
};

export const publicUploadController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.body.filename)
    return next({ status: 422, message: "missing filename" });
  if (!req.file) return next({ status: 422, message: "missing file" });

  try {
    const fileResponse = await uploadPublicFile(req.file, req.body.filename);

    res.json(fileResponse);
  } catch (err) {
    next(err);
  }
};

export const publicDownloadController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const filePath = buildFilePath(req.params.fileKey, req.params.fileName);

  try {
    const { body, headers, isPrivate } = await getFileFromS3(filePath);

    if (isPrivate) return next({ status: 400, message: "bad request" });

    res.set(headers);
    res.send(body);
  } catch (err) {
    next(err);
  }
};

export const privateDownloadController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const filePath = buildFilePath(req.params.fileKey, req.params.fileName);

  try {
    const { body, headers } = await getFileFromS3(filePath);

    res.set(headers);
    res.send(body);
  } catch (err) {
    next(err);
  }
};
