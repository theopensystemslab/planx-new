import type { RequestHandler } from "express";
import { fileTypeFromBuffer, supportedExtensions } from "file-type";

import { getFileExtension } from "./utils.js";

/**
 * Maps our accepted extension variants to file-type's canonical 'ext' values
 */
const EXTENSION_ALIASES: Record<string, string> = {
  jpeg: "jpg",
  tiff: "tif",
  mpeg: "mpg",
};

/**
 * Verify sniffed file content against the claimed extension, for any extension file-type is
 * able to reliably detect (see `supportedExtensions`).
 *
 * Notably, this distinguishes genuine .docx/.xlsx (OOXML) from macro-enabled .docm/.xlsm by inspecting
 * the zip package internals - so a macro-enabled file renamed to .docx/.xlsx is still caught.
 *
 * If file-type can't determine a type at all, we allow the upload - we only want to reject
 * confirmed mismatches, not penalise formats we have no reliable way to verify.
 *
 * NB. Function could be expanded (e.g. to verify SVGs) by integrating further detectors.
 * See: https://github.com/sindresorhus/file-type#available-third-party-file-type-detectors
 */
export const validateModernFileContent = async (
  buffer: Buffer,
  ext: string,
): Promise<boolean> => {
  const bareExt = ext.replace(/^\./, "");
  const canonicalExt = EXTENSION_ALIASES[bareExt] || bareExt;

  // full list of supported types: https://github.com/sindresorhus/file-type#supported-file-types
  if (!supportedExtensions.has(canonicalExt)) return true;

  const detected = await fileTypeFromBuffer(buffer, {
    // allow some grace in case an audio MPEG is misaligned (technically invalid, but it happens)
    mpegOffsetTolerance: 10,
  });
  if (!detected) return true;

  return detected.ext === canonicalExt;
};

/**
 * Validate the *content* of an uploaded file against its claimed extension.
 *
 * This middleware should be used after useFileUpload, so the extension itself is
 * already validated, and the file has been read into memory and can be analysed.
 *
 * TODO: add logic to detect and drop macros in office files (a la defense in depth)
 * inspiration: https://github.com/decalage2/oletools/wiki/olevba
 */
export const useFileContentValidation: RequestHandler = async (
  req,
  res,
  next,
) => {
  if (!req.file) return next();

  const ext = getFileExtension(req.file.originalname);
  const isValid = await validateModernFileContent(req.file.buffer, ext);

  if (!isValid) {
    return res.status(415).json({
      error: `File content does not match given extension: ${ext}`,
    });
  }

  next();
};
