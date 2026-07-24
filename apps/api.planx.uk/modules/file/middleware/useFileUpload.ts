import { ALLOWED_EXTENSIONS, MAX_UPLOAD_SIZE_BYTES } from "@planx/file-upload";
import type { RequestHandler } from "express";
import multer from "multer";
import path from "path";

export const getFileExtension = (filename: string): string => {
  return path.extname(filename).toLowerCase();
};

export const validateExtension = (filename: string): boolean => {
  return ALLOWED_EXTENSIONS.includes(getFileExtension(filename));
};

/**
 * Filter out invalid files based on their extension.
 * See @planx/file-upload for the shared, canonical ALLOWED_EXTENSIONS list
 * (kept in sync with the frontend dropzone's ALLOWED_EXTENSIONS_BY_MIME_TYPE map).
 *
 * NB. We would also validate ext against magic number here, but fileFilter runs before file is read into memory (i.e. no buffer)
 */
const fileFilter: multer.Options["fileFilter"] = (_req, file, callback) => {
  if (!validateExtension(file.originalname)) {
    callback(
      new Error(
        `Unsupported file type. Extension: ${getFileExtension(file.originalname)}`,
      ),
    );
  }
  callback(null, true);
};

const multerOptions: multer.Options = {
  // multer defaults to in-memory (RAM) storage, so we make this explicit here
  storage: multer.memoryStorage(),
  fileFilter,
  limits: {
    fileSize: MAX_UPLOAD_SIZE_BYTES,
  },
};

const upload = multer(multerOptions).single("file");

export const useFileUpload: RequestHandler = (req, res, next) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      const status = err.code === "LIMIT_FILE_SIZE" ? 413 : 400;
      return res.status(status).json({ error: err.message });
    }
    if (err instanceof Error) {
      // fileFilter rejection - unsupported file type
      return res.status(415).json({ error: err.message });
    }
    // System error - log to Airbrake, return 5XX to user
    if (err) return next(err);
    next();
  });
};
