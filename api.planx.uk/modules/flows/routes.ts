import { Router } from "express";
import { usePlatformAdminAuth, useTeamEditorAuth } from "../auth/middleware";
import { publishFlow, validateAndDiffFlow } from "./service/publish";
import { moveFlow } from "./service/moveFlow";
import { findAndReplaceInFlow } from "./service/findReplace";
import { copyPortalAsFlow } from "./service/copyPortalAsFlow";
import { $public } from "../../client";
import { gql } from "graphql-request";
import { stringify } from "csv-stringify";
import { copyFlowController, copyFlowSchema } from "./copyFlow/controller";
import { validate } from "../../shared/middleware/validate";
const router = Router();

router.post(
  "/:flowId/copy",
  useTeamEditorAuth,
  validate(copyFlowSchema),
  copyFlowController,
);
router.post("/:flowId/diff", useTeamEditorAuth, validateAndDiffFlow);
router.post("/:flowId/move/:teamSlug", useTeamEditorAuth, moveFlow);
router.post("/:flowId/publish", useTeamEditorAuth, publishFlow);

/**
 * @swagger
 * /flows/{flowId}/search:
 *  post:
 *    summary: Find and replace
 *    description: Find and replace a data variable in a flow
 *    tags:
 *      - flows
 *    parameters:
 *      - in: path
 *        name: flowId
 *        type: string
 *        required: true
 *      - in: query
 *        name: find
 *        type: string
 *        required: true
 *      - in: query
 *        name: replace
 *        type: string
 *        required: false
 *    responses:
 *      '200':
 *        description: OK
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  required: true
 *                matches:
 *                  type: object
 *                  required: true
 *                  additionalProperties: true
 *                updatedFlow:
 *                  type: object
 *                  required: false
 *                  additionalProperties: true
 *                  properties:
 *                    _root:
 *                      type: object
 *                      properties:
 *                        edges:
 *                          type: array
 *                          items:
 *                            type: string
 */
router.post("/:flowId/search", usePlatformAdminAuth, findAndReplaceInFlow);

router.get(
  "/:flowId/copy-portal/:portalNodeId",
  usePlatformAdminAuth,
  copyPortalAsFlow,
);

interface FlowSchema {
  node: string;
  type: string;
  text: string;
  planx_variable: string;
}

router.get("/:flowId/download-schema", async (req, res, next) => {
  try {
    const { flowSchema } = await $public.client.request<{
      flowSchema: FlowSchema[];
    }>(
      gql`
        query ($flow_id: String!) {
          flowSchema: get_flow_schema(args: { published_flow_id: $flow_id }) {
            node
            type
            text
            planx_variable
          }
        }
      `,
      { flow_id: req.params.flowId },
    );

    if (!flowSchema.length) {
      next({
        status: 404,
        message:
          "Can't find a schema for this flow. Make sure it's published or try a different flow id.",
      });
    } else {
      // build a CSV and stream it
      stringify(flowSchema, { header: true }).pipe(res);

      res.header("Content-type", "text/csv");
      res.attachment(`${req.params.flowId}.csv`);
    }
  } catch (err) {
    next(err);
  }
});

export default router;
