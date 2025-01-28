import multer from "multer";
import path from "path";

/**
 * 30mb to match limit set in frontend
 * See editor.planx.uk/src/@planx/components/shared/PrivateFileUpload/Dropzone.tsx
 */
const FILE_SIZE_LIMIT = 30 * 1024 * 1024;

/**
 * Should match MIME type restrictions in frontend
 * See editor.planx.uk/src/@planx/components/shared/PrivateFileUpload/Dropzone.tsx
 */
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "application/pdf"];
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".pdf"];

const validateExtension = (filename: string): boolean => {
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
    callback(new Error("Unsupported file type"));
  }
};

const multerOptions: multer.Options = {
  limits: {
    fileSize: FILE_SIZE_LIMIT,
  },
  fileFilter,
};

export const useFileUpload = multer(multerOptions).single("file");
