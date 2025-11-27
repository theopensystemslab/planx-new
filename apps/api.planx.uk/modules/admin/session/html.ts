import { $api } from "../../../client/index.js";
import type { RequestHandler } from "express";
import { generateHTMLForSession } from "../../lps/service/generateHTML.js";

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

    const html = await generateHTMLForSession(session);

    res.header("Content-type", "text/html");
    res.send(html);
  } catch (error) {
    return next({
      message: "Failed to build HTML: " + (error as Error).message,
    });
  }
};
