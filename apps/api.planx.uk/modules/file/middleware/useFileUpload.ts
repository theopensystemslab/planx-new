import type { RequestHandler } from "express";
import multer from "multer";
import path from "path";

/**
 * 30mb to match limit set in frontend
 * See apps/editor.planx.uk/src/@planx/components/shared/PrivateFileUpload/Dropzone.tsx
 */
const FILE_SIZE_LIMIT = 30 * 1024 * 1024;

/**
 * Must be kept synchronised with the ALLOWED_EXTENSIONS_BY_MIME_TYPE map in the frontend.
 * See apps/editor.planx.uk/src/@planx/components/shared/PrivateFileUpload/Dropzone.tsx
 *
 * Validation is based on extension, since many formats do not have reliable MIME types.
 * Uploaded files are then checked by Scanii (managed via a pair of Lambdas) after reaching S3.
 */
const ALLOWED_EXTENSIONS = [
  // PDFs
  ".pdf",
  // raster images
  ".bmp",
  ".gif",
  ".jpg",
  ".jpeg",
  ".png",
  ".tif",
  ".tiff",
  ".webp",
  // vector graphics
  ".svg",
  // CAD and BIM
  ".bim",
  ".dwg",
  ".dxf",
  ".ifc",
  ".plt",
  ".rvt",
  ".skp",
  // Text, MS Office documents and spreadsheets
  ".csv",
  ".doc",
  ".docx",
  ".rtf",
  ".txt",
  ".xls",
  ".xlsx",
  // videos
  ".avi",
  ".mkv",
  ".mov",
  ".mp4",
  ".mpg",
  ".mpeg",
  ".webm",
  ".wmv",
  // GML (Geographic Markup Language)
  ".gml",
];

export const getFileExtension = (filename: string): string => {
  return path.extname(filename).toLowerCase();
};

export const validateExtension = (filename: string): boolean => {
  return ALLOWED_EXTENSIONS.includes(getFileExtension(filename));
};

/**
 * Filter out invalid files based on their extension
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
    fileSize: FILE_SIZE_LIMIT,
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
