import { Router } from "express";
import { usePlatformAdminAuth, useTeamEditorAuth } from "../auth/middleware";
import { publishFlowController } from "./publish/controller";
import { $public } from "../../client";
import { gql } from "graphql-request";
import { stringify } from "csv-stringify";
import { copyFlowController, copyFlowSchema } from "./copyFlow/controller";
import { validate } from "../../shared/middleware/validate";
import {
  copyFlowAsPortalSchema,
  copyPortalAsFlowController,
} from "./copyFlowAsPortal/controller";
import {
  findAndReplaceController,
  findAndReplaceSchema,
} from "./findReplace/controller";
import { moveFlowController, moveFlowSchema } from "./moveFlow/controller";
import { validateAndDiffFlow } from "./validate/service";
import { publishFlowSchema } from "./publish/controller";
const router = Router();

router.post(
  "/:flowId/copy",
  useTeamEditorAuth,
  validate(copyFlowSchema),
  copyFlowController,
);

router.post(
  "/:flowId/search",
  usePlatformAdminAuth,
  validate(findAndReplaceSchema),
  findAndReplaceController,
);

router.put(
  "/:flowId/copy-portal/:portalNodeId",
  usePlatformAdminAuth,
  validate(copyFlowAsPortalSchema),
  copyPortalAsFlowController,
);

router.post(
  "/:flowId/move/:teamSlug",
  useTeamEditorAuth,
  validate(moveFlowSchema),
  moveFlowController,
);

router.post(
  "/:flowId/publish",
  useTeamEditorAuth,
  validate(publishFlowSchema),
  publishFlowController,
);

router.post("/:flowId/diff", useTeamEditorAuth, validateAndDiffFlow);

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
