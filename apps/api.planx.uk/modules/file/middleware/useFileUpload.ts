import {
  getFileExtension,
  isAllowedExtension,
  MAX_UPLOAD_SIZE_BYTES,
  MIN_UPLOAD_SIZE_BYTES,
} from "@planx/file-upload";
import type { RequestHandler } from "express";
import multer from "multer";

/**
 * Rejection raised by our fileFilter, so we can tell it apart from any other error multer passes on
 */
class UnsupportedFileTypeError extends Error {
  constructor(filename: string) {
    super(`Unsupported file type. Extension: ${getFileExtension(filename)}`);
    this.name = "UnsupportedFileTypeError";
    // no need for Object.setPrototypeOf() here because we target esnext (not ES2015 or below)
  }
}

/**
 * Filter out invalid files based on their extension.
 * See @planx/file-upload for the shared, canonical allowlist.
 *
 * NB. We would also validate ext against magic number here, but fileFilter runs before file is read into memory (i.e. no buffer).
 */
const fileFilter: multer.Options["fileFilter"] = (_req, file, callback) => {
  if (!isAllowedExtension(file.originalname)) {
    return callback(new UnsupportedFileTypeError(file.originalname));
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
    if (err instanceof UnsupportedFileTypeError) {
      return res.status(415).json({ error: err.message });
    }
    // There is no server-side work which could reasonably fail here, so we don't submit to Airtable.
    // An error suggests the request didn't arrive intact, e.g. client disconnected mid-upload, or sent a malformed body.
    if (err) {
      console.warn({
        message: "File upload request failed",
        error: err instanceof Error ? err.message : err,
        path: req.path,
      });
      return res
        .status(400)
        .json({ error: "File upload failed, please try again" });
    }
    // multer has no built-in minimum size check, so we enforce it manually
    if (req.file && req.file.size < MIN_UPLOAD_SIZE_BYTES) {
      return res.status(400).json({ error: "File is empty" });
    }
    next();
  });
};
