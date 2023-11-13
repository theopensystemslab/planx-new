import { Request, Response, NextFunction } from "express";
import { $api } from "../../../client";

/**
 * @swagger
 * /admin/session/{sessionId}/xml:
 *  get:
 *    summary: Generates a OneApp XML
 *    description: Generates a OneApp XML
 *    tags:
 *      - admin
 *    parameters:
 *      - $ref: '#/components/parameters/sessionId'
 *    security:
 *      - bearerAuth: []
 */
export const getOneAppXML = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const xml = await $api.export.oneAppPayload(req.params.sessionId);
    res.set("content-type", "text/xml");
    return res.send(xml);
  } catch (error) {
    return next({
      message: "Failed to get OneApp XML: " + (error as Error).message,
    });
  }
};
