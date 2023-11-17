import { NextFunction, Request, Response } from "express";
import { buildSubmissionExportZip } from "../../send/service/exportZip";

/**
 * @swagger
 * /admin/session/{sessionId}/zip:
 *  get:
 *    summary: Generates and downloads a zip file for Send to Email, or Uniform when XML is included
 *    description: Generates and downloads a zip file for Send to Email, or Uniform when XML is included
 *    tags:
 *      - admin
 *    parameters:
 *      - $ref: '#/components/parameters/sessionId'
 *      - in: query
 *        name: includeXML
 *        type: boolean
 *        required: false
 *        description: If the OneApp XML file should be included in the zip
 *    security:
 *      - bearerAuth: []
 */
export async function generateZip(
  req: Request,
  res: Response,
  next: NextFunction,
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
