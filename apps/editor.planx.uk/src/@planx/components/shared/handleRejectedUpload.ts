import { ALLOWED_EXTENSIONS, MAX_UPLOAD_SIZE_BYTES } from "@planx/file-upload";
import type { FileRejection } from "react-dropzone";

/**
 * Shows an alert to the user with errors that are probably going to
 * be related to either invalid file size or type.
 *
 * @param fileRejections - array of errors provided by Dropzone
 */
function handleRejectedUpload(fileRejections: Array<FileRejection>) {
  // XXX: There can be multiple file rejections with different errors
  // We display only the first error to keep the UI simple and easy to understand
  const errorCode = fileRejections[0].errors[0].code;
  const message = (() => {
    switch (errorCode) {
      case "file-too-large":
        return `File must be smaller than ${MAX_UPLOAD_SIZE_BYTES * 1e-6}MB`;
      case "file-invalid-type":
        return (
          "File must be one of the following types: " +
          ALLOWED_EXTENSIONS.map((ext) => ext.replace(/^\./, "")).join(", ")
        );
      default:
        return fileRejections[0].errors[0].message;
    }
  })();
  window.alert(message);
}

export default handleRejectedUpload;
