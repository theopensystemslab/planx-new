import { NextFunction, Request, Response } from "express";
import { buildSubmissionExportZip } from "../../send/exportZip";

export async function generateZip(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const zip = await buildSubmissionExportZip({
      sessionId: req.params.sessionId,
      includeOneAppXML: req.query.includeXML === "true",
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
