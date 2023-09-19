import { Request, Response, NextFunction } from "express";
import { $admin } from "../../client";

/**
 * @swagger
 * /admin/session/{sessionId}/digital-planning-data:
 *  get:
 *    summary: Generates a Digital Planning Data payload
 *    description: Generates a Digital Planning Data payload, based on the Digital Planning Data Open API schema
 *    tags:
 *      - admin
 *    parameters:
 *      - $ref: '#/components/parameters/sessionId'
 *    security:
 *      - userJWT: []
 */
export const getDigitalPlanningDataPayload = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { exportData } = await $admin.export.digitalPlanningDataPayload(
      req.params.sessionId,
    );
    res.set("content-type", "application/json");
    return res.send(exportData);
  } catch (error) {
    return next({
      message:
        "Failed to make Digital Planning Data payload: " +
        (error as Error).message,
    });
  }
};
