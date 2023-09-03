import { stringify } from "csv-stringify";
import { NextFunction, Request, Response } from "express";
import { getClient } from "../../client";

/**
 * @swagger
 * /admin/session/{sessionId}/csv:
 *  get:
 *    summary: Generates or downloads an application CSV file
 *    description: Generates or downloads an application CSV file
 *    tags:
 *      - admin
 *    parameters:
 *      - $ref: '#/components/parameters/sessionId'
 *      - in: query
 *        name: download
 *        type: boolean
 *        required: false
 *        description: If a CSV file should be downloaded, or its raw data returned
 *    security:
 *      - userJWT: []
 */
export async function getCSVData(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const $client = getClient();
    const { responses } = await $client.export.csvData(req.params.sessionId);

    if (req.query?.download) {
      stringify(responses, {
        columns: ["question", "responses", "metadata"],
        header: true,
      }).pipe(res);
      res.header("Content-type", "text/csv");
      res.attachment(`${req.params.sessionId}.csv`);
    } else {
      res.send(responses);
    }
  } catch (error) {
    return next({
      message: "Failed to make CSV data: " + (error as Error).message,
    });
  }
}

/**
 * @swagger
 * /admin/session/{sessionId}/csv-redacted:
 *  get:
 *    summary: Generates or downloads an application CSV file with personal details redacted
 *    description: Generates or downloads an application CSV file with personal details redacted
 *    tags:
 *      - admin
 *    parameters:
 *      - $ref: '#/components/parameters/sessionId'
 *      - in: query
 *        name: download
 *        type: boolean
 *        required: false
 *        description: If a CSV file should be downloaded, or its raw data returned
 *    security:
 *      - userJWT: []
 */
export async function getRedactedCSVData(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const $client = getClient();
    const { redactedResponses } = await $client.export.csvData(
      req.params.sessionId,
    );

    if (req.query?.download) {
      stringify(redactedResponses, {
        columns: ["question", "responses", "metadata"],
        header: true,
      }).pipe(res);
      res.header("Content-type", "text/csv");
      res.attachment(`${req.params.sessionId}.csv`);
    } else {
      res.send(redactedResponses);
    }
  } catch (error) {
    return next({
      message: "Failed to make CSV data: " + (error as Error).message,
    });
  }
}
