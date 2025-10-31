import { JSDOM } from "jsdom";
import createDOMPurify, { type WindowLike } from "dompurify";
import { generateApplicationHTML } from "@opensystemslab/planx-core";
import type {
  DrawBoundaryUserAction,
  PlanXExportData,
} from "@opensystemslab/planx-core/types";
import { $api } from "../../../client/index.js";
import type { RequestHandler } from "express";
import { MY_MAP_ATTRS } from "../../../lib/map.js";

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

    const responses = await $api.export.digitalPlanningDataPayload(
      req.params.sessionId,
    );
    const boundingBox = session.data.passport.data?.["proposal.site.buffered"];
    const userAction = session.data.passport.data?.[
      "drawBoundary.action"
    ] as unknown as DrawBoundaryUserAction | undefined;

    const html = generateApplicationHTML({
      planXExportData: responses,
      boundingBox,
      userAction,
    });

    // Sanitise output, allowing my-map webcomponent
    const window = new JSDOM("").window;
    const DOMPurify = createDOMPurify(window as unknown as WindowLike);
    const cleanHTML = DOMPurify.sanitize(html, {
      WHOLE_DOCUMENT: true,
      ADD_TAGS: ["my-map"],
      ADD_ATTR: MY_MAP_ATTRS,
      CUSTOM_ELEMENT_HANDLING: {
        tagNameCheck: (tagName) => tagName === "my-map",
        attributeNameCheck: (attr, tagName) => {
          if (tagName === "my-map") return MY_MAP_ATTRS.includes(attr);
          return false;
        },
      },
    });

    res.header("Content-type", "text/html");
    res.send(cleanHTML);
  } catch (error) {
    return next({
      message: "Failed to build HTML: " + (error as Error).message,
    });
  }
};
