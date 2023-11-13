import { NextFunction, Request, Response } from "express";
import { $api } from "../../../client";

/**
 * @swagger
 * /admin/session/{sessionId}/digital-planning-application:
 *  get:
 *    summary: Generates a Digital Planning Application payload
 *    description: Generates a Digital Planning Application payload and validates it against the Digital Planning Data JSON Schema
 *    tags:
 *      - admin
 *    parameters:
 *      - $ref: '#/components/parameters/sessionId'
 *    security:
 *      - bearerAuth: []
 */
export const getDigitalPlanningApplicationPayload = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await $api.export.digitalPlanningDataPayload(
      req.params.sessionId,
    );
    res.set("content-type", "application/json");
    return res.send(data);
  } catch (error) {
    return next({
      message:
        "Failed to make Digital Planning Application payload: " +
        (error as Error).message,
    });
  }
};
