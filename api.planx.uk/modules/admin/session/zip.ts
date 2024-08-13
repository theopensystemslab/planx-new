import { NextFunction, Request, Response } from "express";
import { buildSubmissionExportZip } from "../../send/utils/exportZip.js";

/**
 * @swagger
 * /admin/session/{sessionId}/zip:
 *  get:
 *    summary: Generates and downloads a zip file for integrations
 *    description: Generates and downloads a zip file for integrations
 *    tags:
 *      - admin
 *    parameters:
 *      - $ref: '#/components/parameters/sessionId'
 *      - in: query
 *        name: includeOneAppXML
 *        type: boolean
 *        required: false
 *        description: If the OneApp XML file should be included in the zip
 *      - in: query
 *        name: includeDigitalPlanningJSON
 *        type: boolean
 *        required: false
 *        description: If the Digital Planning JSON file should be included in the zip (only generated for supported application types)
 *      - in: query
 *        name: onlyDigitalPlanningJSON
 *        type: boolean
 *        required: false
 *        description: If the Digital Planning JSON file should be the ONLY file included in the zip (only generated for supported application types)
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
      includeOneAppXML: req.query.includeOneAppXML === "true",
      includeDigitalPlanningJSON:
        req.query.includeDigitalPlanningJSON === "false",
      onlyDigitalPlanningJSON: req.query.onlyDigitalPlanningJSON === "false",
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
