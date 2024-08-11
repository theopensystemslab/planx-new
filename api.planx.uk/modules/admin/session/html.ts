import { generateApplicationHTML } from "@opensystemslab/planx-core";
import type {
  DrawBoundaryUserAction,
  PlanXExportData,
} from "@opensystemslab/planx-core/types";
import { $api } from "../../../client/index.js";
import type { RequestHandler } from "express";

type HTMLExportHandler = RequestHandler<{ sessionId: string }, string>;

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
 *      - bearerAuth: []
 */
export const getHTMLExport: HTMLExportHandler = async (req, res, next) => {
  try {
    const session = await $api.session.find(req.params.sessionId);
    if (!session) throw Error(`Unable to find session ${req.params.sessionId}`);

    const responses = await $api.export.csvData(req.params.sessionId);
    const boundingBox = session.data.passport.data[
      "property.boundary.site.buffered"
    ] as unknown as GeoJSON.Feature;
    const userAction = session.data.passport.data?.[
      "drawBoundary.action"
    ] as unknown as DrawBoundaryUserAction | undefined;

    const html = generateApplicationHTML({
      planXExportData: responses as PlanXExportData[],
      boundingBox,
      userAction,
    });

    res.header("Content-type", "text/html");
    res.send(html);
  } catch (error) {
    return next({
      message: "Failed to build HTML: " + (error as Error).message,
    });
  }
};

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
 *      - bearerAuth: []
 */
export const getRedactedHTMLExport: HTMLExportHandler = async (
  req,
  res,
  next,
) => {
  try {
    const session = await $api.session.find(req.params.sessionId);
    if (!session) throw Error(`Unable to find session ${req.params.sessionId}`);

    const redactedResponses = await $api.export.csvDataRedacted(
      req.params.sessionId,
    );
    const boundingBox = session.data.passport.data[
      "property.boundary.site.buffered"
    ] as unknown as GeoJSON.Feature;
    const userAction = session.data.passport.data?.[
      "drawBoundary.action"
    ] as unknown as DrawBoundaryUserAction | undefined;

    const html = generateApplicationHTML({
      planXExportData: redactedResponses as PlanXExportData[],
      boundingBox,
      userAction,
    });

    res.header("Content-type", "text/html");
    res.send(html);
  } catch (error) {
    return next({
      message: "Failed to build HTML: " + (error as Error).message,
    });
  }
};
