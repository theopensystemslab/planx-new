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
 * Extensions file-type has no entry for doc/xls, whose container format it can still identify.
 *
 * Legacy Office files are OLE compound documents, which file-type reports as 'cfb' rather than
 * as 'doc'/'xls'. Without this they would skip validation entirely (see the supportedExtensions
 * check below) - which would make them the only widely-used formats we accept whose content is
 * never checked at all. Verifying the container does not say anything about macros; it just
 * stops arbitrary bytes being accepted under a .doc or .xls name.
 */
const CONTAINER_TYPES: Record<string, string> = {
  doc: "cfb",
  xls: "cfb",
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
  const expectedExt = CONTAINER_TYPES[canonicalExt] ?? canonicalExt;

  // full list of supported types: https://github.com/sindresorhus/file-type#supported-file-types
  if (!supportedExtensions.has(expectedExt)) return true;

  const detected = await fileTypeFromBuffer(buffer, {
    // allow some grace in case an audio MPEG is misaligned (technically invalid, but it happens)
    mpegOffsetTolerance: 10,
  });
  if (!detected) return true;

  return detected.ext === expectedExt;
};

/**
 * Validate the *content* of an uploaded file against its claimed extension.
 *
 * This middleware should be used after useFileUpload, so the extension itself is
 * already validated, and the file has been read into memory and can be analysed.
 *
 * Note this checks content against the claimed extension only - it is not a malware or macro
 * check. Every upload is scanned by Scanii, and councils are expected to run their own scans
 * and to take responsibility for files they choose to open. See the scan verification section
 * of doc/how-to/how-to-identify-missing-files.md.
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
