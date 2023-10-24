import { NextFunction, Request, Response } from "express";
import { $api } from "../../client";

/**
 * @swagger
 * /admin/session/{sessionId}/bops:
 *  get:
 *    summary: Generates a Back Office Planning System (BOPS) payload
 *    description: Generates a BOPS payload
 *    tags:
 *      - admin
 *    parameters:
 *      - $ref: '#/components/parameters/sessionId'
 *    security:
 *      - bearerAuth: []
 */
export const getBOPSPayload = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const exportData = await $api.export.bopsPayload(req.params.sessionId);
    res.set("content-type", "application/json");
    return res.send(exportData);
  } catch (error) {
    return next({
      message: "Failed to get BOPS payload: " + (error as Error).message,
    });
  }
};
