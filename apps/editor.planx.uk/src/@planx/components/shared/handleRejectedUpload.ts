import { FileRejection } from "react-dropzone";

/**
 * Shows an alert to the user with errors that are probably going to
 * be related to either invalid file size or type.
 *
 * @param fileRejections - array of errors provided by Dropzone
 */
function handleRejectedUpload(fileRejections: Array<FileRejection>) {
  // XXX: Even though there can be multiple file rejections with multiple errors, here we display only one error from one file in order to keep the UI simple and easy to understand
  window.alert(fileRejections[0].errors[0].message);
}

export default handleRejectedUpload;
