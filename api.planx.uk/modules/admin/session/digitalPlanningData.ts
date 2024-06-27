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
 *      - in: query
 *        name: skipValidation
 *        type: boolean
 *        required: false
 *        description: If invalid JSON data should still be returned, instead of logging validation errors
 *    security:
 *      - bearerAuth: []
 */
export const getDigitalPlanningApplicationPayload = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    let skipValidation = false;
    if (req.query?.skipValidation) {
      skipValidation =
        (req.query.skipValidation as string).toLowerCase() === "true";
    }

    const data = await $api.export.digitalPlanningDataPayload(
      req.params.sessionId,
      skipValidation,
    );

    res.set("content-type", "application/json");
    return res.send(data);
  } catch (error) {
    return next({
      message: `Failed to make Digital Planning Application payload: ${error}`,
    });
  }
};
