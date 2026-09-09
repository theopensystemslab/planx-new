import { getFileExtension, isAllowedExtension } from "@planx/file-upload";
import type { FileError } from "react-dropzone";
import { ErrorCode } from "react-dropzone";

/**
 * Extension checks for react-dropzone's `validator` option.
 * See: https://react-dropzone.js.org/examples/validator#custom-validation
 *
 * react-dropzone's `accept` logic accepts files over-zealousy. That is, it accepts a file if its browser-reported
 * MIME type OR its extension matches, so any MIME type we include also admits every other extension the browser maps
 * onto that type. For example, the catchall 'application/octet-stream' admits .exe or .com files, which we don't allow.
 * We therefore validate strictly by extension on the frontend, so they never hit the API (which will reject them anyway).
 *
 * We deliberately reuse react-dropzone's own `file-invalid-type` code so these rejections flow through
 * the same handling as its built-in ones (see handleRejectedUpload).
 */
const invalidType = (file: File): FileError => ({
  // we reuse react-dropzone's own `file-invalid-type` code so rejections flow through handleRejectedUpload
  code: ErrorCode.FileInvalidType,
  message: `File extension not allowed: ${file.name}`,
});

export const validateExtension = (file: File): FileError | null =>
  isAllowedExtension(file.name) ? null : invalidType(file);

/**
 * As above, but for dropzones accepting a narrower list than the full allowlist (e.g. images only).
 * Pass the extensions - with leading dots - which this dropzone accepts.
 */
export const createExtensionValidator =
  (allowedExtensions: string[]) =>
  (file: File): FileError | null =>
    allowedExtensions.includes(getFileExtension(file.name))
      ? null
      : invalidType(file);
