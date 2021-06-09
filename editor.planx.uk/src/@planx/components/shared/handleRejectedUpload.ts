import { FileRejection } from "react-dropzone";

/**
 * Shows an alert to the user with errors that are probably going to
 * be related to either invalid file size or type.
 *
 * @param fileRejections - array of errors provided by Dropzone
 */
function handleRejectedUpload(fileRejections: Array<FileRejection>) {
  const errors = fileRejections.map((rejection) => ({
    file: rejection.file.name,
    errors: rejection.errors.map((error) => error.message),
  }));

  alert(JSON.stringify({ errors }, null, 2));
}

export default handleRejectedUpload;
