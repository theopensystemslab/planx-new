import { ALLOWED_EXTENSIONS, MAX_UPLOAD_SIZE_MB } from "@planx/file-upload";
import type { FileRejection } from "react-dropzone";
import { ErrorCode } from "react-dropzone";

/**
 * Builds a user-facing alert for a rejection by react-dropzone.
 *
 * @param fileRejections - array of errors provided by Dropzone
 * @param allowedExtensions - defaults to the full allowlist; can also pass a narrower list
 */
export const getRejectionMessage = (
  fileRejections: Array<FileRejection>,
  allowedExtensions: string[] = ALLOWED_EXTENSIONS,
): string => {
  // XXX: There can be multiple file rejections with different errors
  // We display only the first error to keep the UI simple and easy to understand
  const { code, message } = fileRejections[0].errors[0];

  switch (code) {
    case ErrorCode.FileTooLarge:
      return `File must be smaller than ${MAX_UPLOAD_SIZE_MB}MB`;
    case ErrorCode.FileInvalidType:
      return (
        "File must be one of the following types: " +
        allowedExtensions.map((ext) => ext.replace(/^\./, "")).join(", ")
      );
    default:
      return message;
  }
};

/**
 * Shows the above as an alert/modal. Dropzones with somewhere better to put an error
 * (e.g. an ErrorWrapper or tooltip) should call getRejectionMessage directly.
 */
function handleRejectedUpload(fileRejections: Array<FileRejection>) {
  window.alert(getRejectionMessage(fileRejections));
}

export default handleRejectedUpload;
