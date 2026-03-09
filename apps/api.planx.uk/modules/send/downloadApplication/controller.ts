import { logDuration } from "../../../lib/performance.js";
import { buildSubmissionExportZip } from "../utils/exportZip.js";
import type { DownloadApplication } from "./types.js";

export const downloadApplication: DownloadApplication = async (
  _req,
  res,
  next,
) => {
  const { sessionId } = res.locals;

  try {
    // Create the submission zip
    const zip = await logDuration(`zipTotal-${sessionId}`, () =>
      buildSubmissionExportZip({
        sessionId,
        includeDigitalPlanningJSON: true,
      }),
    );

    // Send it to the client
    const zipData = zip.toBuffer();
    res.set("Content-Type", "application/octet-stream");
    res.set("Content-Disposition", `attachment; filename=${zip.filename}`);
    res.set("Content-Length", zipData.length.toString());
    res.status(200).send(zipData);

    // Clean up the local zip file
    zip.remove();
  } catch (error) {
    return next({
      error,
      message: `Failed to download application files. ${error}`,
    });
  }
};
