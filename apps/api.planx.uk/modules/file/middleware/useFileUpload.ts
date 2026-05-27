import multer from "multer";
import path from "path";
import type { RequestHandler } from "express";

/**
 * 30mb to match limit set in frontend
 * See apps/editor.planx.uk/src/@planx/components/shared/PrivateFileUpload/Dropzone.tsx
 */
const FILE_SIZE_LIMIT = 30 * 1024 * 1024;

/**
 * Should match MIME type restrictions in frontend
 * See apps/editor.planx.uk/src/@planx/components/shared/PrivateFileUpload/Dropzone.tsx
 */
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "application/pdf",
  "image/svg+xml",
];
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".pdf", ".svg"];

export const validateExtension = (filename: string): boolean => {
  const extension = path.extname(filename).toLowerCase();
  return ALLOWED_EXTENSIONS.includes(extension);
};

/**
 * Filter out invalid files
 */
const fileFilter: multer.Options["fileFilter"] = (_req, file, callback) => {
  const isValidMimeType = ALLOWED_MIME_TYPES.includes(file.mimetype);
  const isValidExtension = validateExtension(file.originalname);

  if (isValidMimeType && isValidExtension) {
    callback(null, true);
  } else {
    callback(
      new Error(
        `Unsupported file type. Mimetype: ${file.mimetype}. Extension: ${path.extname(file.originalname).toLowerCase()}`,
      ),
    );
  }
};

const multerOptions: multer.Options = {
  limits: {
    fileSize: FILE_SIZE_LIMIT,
  },
  fileFilter,
};

const upload = multer(multerOptions).single("file");

export const useFileUpload: RequestHandler = (req, res, next) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError || err instanceof Error) {
      // User-facing validation failure, e.g. unsupported file type
      return res.status(400).json({ error: err.message });
    }
    // System error - log to Airbrake, return 5XX to user
    if (err) return next(err);
    next();
  });
};
