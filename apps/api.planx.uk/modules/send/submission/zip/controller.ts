import { getClient } from "../../../../client/index.js";
import { logDuration } from "../../../../lib/performance.js";
import type { ValidatedRequestHandler } from "../../../../shared/middleware/validate.js";
import { buildSubmissionExportZip } from "../../utils/exportZip.js";
import type { submissionSchema } from "./../schema.js";

type SubmissionController = ValidatedRequestHandler<
  typeof submissionSchema,
  Buffer
>;

export const submissionZipController: SubmissionController = async (
  _req,
  res,
  next,
) => {
  const sessionId = res.locals.parsedReq.params.sessionId;

  try {
    const session = await getClient().session.find(sessionId);
    if (!session) throw Error(`Unable to find session ${sessionId}`);

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
      message: "Failed to download submission zip: " + (error as Error).message,
    });
  }
};
