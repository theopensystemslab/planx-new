import { generateApplicationHTML } from "@opensystemslab/planx-core";
import { $admin } from "../../client";
import type { NextFunction, Request, Response } from "express";
import type { PlanXExportData } from "@opensystemslab/planx-core/types";
import { getTeamForSession } from "../../team/utils";

/**
 * @swagger
 * /admin/session/{sessionId}/html:
 *  get:
 *    summary: Generates an application overview HTML
 *    description: Generates an application overview HTML
 *    tags:
 *      - admin
 *    parameters:
 *      - $ref: '#/components/parameters/sessionId'
 *    security:
 *      - userJWT: []
 */
export async function getHTMLExport(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { responses } = await $admin.export.csvData(req.params.sessionId);
    const { boundaryBBox } = await getTeamForSession(req.params.sessionId);
    const html = generateApplicationHTML({
      planXExportData: responses as PlanXExportData[],
      teamBBox: boundaryBBox,
    });

    res.header("Content-type", "text/html");
    res.send(html);
  } catch (error) {
    return next({
      message: "Failed to build HTML: " + (error as Error).message,
    });
  }
}

/**
 * @swagger
 * /admin/session/{sessionId}/html-redacted:
 *  get:
 *    summary: Generates an application overview HTML with personal details redacted
 *    description: Generates an application overview HTML with personal details redacted
 *    tags:
 *      - admin
 *    parameters:
 *      - $ref: '#/components/parameters/sessionId'
 *    security:
 *      - userJWT: []
 */
export async function getRedactedHTMLExport(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { redactedResponses } = await $admin.export.csvData(
      req.params.sessionId,
    );
    const { boundaryBBox } = await getTeamForSession(req.params.sessionId);
    res.header("Content-type", "text/html");
    const html = generateApplicationHTML({
      planXExportData: redactedResponses as PlanXExportData[],
      teamBBox: boundaryBBox,
    });
    res.send(html);
  } catch (error) {
    return next({
      message: "Failed to build HTML: " + (error as Error).message,
    });
  }
}
