import type { NextFunction, Request, Response } from "express";
import { buildSubmissionExportZip } from "../utils/exportZip.js";
import {
  getFlowId,
  getSessionData,
  getTeamEmailSettings,
  getFlowSubmissionEmail,
} from "../email/service.js";
import { logDuration } from "../../../lib/performance.js";

export async function downloadApplicationFiles(
  req: Request<
    { sessionId?: string },
    unknown,
    unknown,
    { email?: string; localAuthority?: string }
  >,
  res: Response,
  next: NextFunction,
) {
  const sessionId = req.params?.sessionId;
  const { email, localAuthority } = req.query;
  if (!sessionId || !email || !localAuthority) {
    return next({
      status: 400,
      message: "Missing values required to access application files",
    });
  }

  try {
    // Confirm that the provided email matches the stored team settings for the provided localAuthority
    const { teamSettings } = await getTeamEmailSettings(localAuthority);
    if (teamSettings.submissionEmail !== decodeURIComponent(email)) {
      return next({
        status: 403,
        message:
          "Provided email address is not enabled to access application files",
      });
    }

    // Fetch this lowcal_session's data
    const sessionData = await getSessionData(sessionId);
    if (!sessionData) {
      return next({
        status: 400,
        message: "Failed to find session data for this sessionId",
      });
    }

    // Get flow ID, in order to access flow submission email
    const flowId = await getFlowId(sessionId);
    if (!flowId) {
      return next({
        status: 400,
        message: "Failed to find flow ID for this sessionId",
      });
    }

    // Get the flow submission email, which will run parallel to getTeamEmailSettings for now
    const submissionEmail = await getFlowSubmissionEmail(flowId);
    if (!submissionEmail) {
      return next({
        status: 400,
        message: "Failed to retrieve submission email for this flow",
      });
    }
    console.log(submissionEmail);

    // create the submission zip
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

    // TODO Record files_downloaded_at timestamp in lowcal_sessions ??
  } catch (error) {
    return next({
      error,
      message: `Failed to download application files. ${error}`,
    });
  }
}
