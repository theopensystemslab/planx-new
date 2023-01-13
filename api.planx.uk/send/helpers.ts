import AdmZip from "adm-zip";
import fs from "fs";

import { getFileFromS3 } from "../s3/getFile";

/**
 * Helper method to locally download S3 files, add them to the zip, then clean them up
 *
 * @param {string} url - our file URL, eg api.planx.uk/file/private/path/key
 * @param {string} path - file name for download
 * @param {AdmZip} folder - AdmZip archive
 */
export async function downloadFile(url: string, path: string, folder: AdmZip) {
  // Files are stored decoded on S3, but encoded in our passport, ensure the key matches S3 before fetching it
  const s3Key = url.split("/").slice(-2).join("/");
  const decodedS3Key = decodeURIComponent(s3Key);

  const { body }: any = await getFileFromS3(decodedS3Key);

  fs.writeFileSync(path, body);

  folder.addLocalFile(path);
  deleteFile(path);
}

/**
 * Helper method to clean up files temporarily stored locally
 *
 * @param {string} path - file name
 */
export function deleteFile(path: string) {
  if (fs.existsSync(path)) {
    fs.unlinkSync(path);
  } else {
    console.log(`Didn't find ${path}, nothing to delete`);
  }
}

// TODO
export function findGeoJSON(
  _passport: unknown
): { type: "Feature" } | undefined {
  return;
}
