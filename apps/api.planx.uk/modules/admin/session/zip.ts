import type { NextFunction, Request, Response } from "express";
import { buildSubmissionExportZip } from "../../send/utils/exportZip.js";

export async function generateZip(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const zip = await buildSubmissionExportZip({
      sessionId: req.params.sessionId,
      includeOneAppXML: req.query.includeOneAppXML === "true",
      includeDigitalPlanningJSON:
        req.query.includeDigitalPlanningJSON === "true",
      onlyDigitalPlanningJSON: req.query.onlyDigitalPlanningJSON === "true",
    });
    res.download(zip.filename, () => {
      zip.remove();
    });
  } catch (error) {
    return next({
      message: "Failed to make zip: " + (error as Error).message,
    });
  }
}
