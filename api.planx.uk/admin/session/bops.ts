import { Request, Response, NextFunction } from "express";
import { $admin } from "../../client";

/**
 * @swagger
 * /admin/session/{sessionId}/bops:
 *  get:
 *    summary: Generates a BOPS payload
 *    description: Generates a BOPS payload, relies on a submission record in `bops_applications`
 *    tags:
 *      - admin
 *    parameters:
 *      - in: path
 *        name: sessionId
 *        type: string
 *        required: true
 *        description: Session id
 *    security:
 *      - bearerAuth: []
 */
export const getBOPSPayload = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { exportData } = await $admin.export.bopsPayload(
      req.params.sessionId,
    );
    res.set("content-type", "application/json");
    return res.send(exportData);
  } catch (error) {
    return next({
      message: "Failed to get BOPS payload: " + (error as Error).message,
    });
  }
};
