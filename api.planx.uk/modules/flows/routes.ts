import { Router } from "express";
import { usePlatformAdminAuth, useTeamEditorAuth } from "../auth/middleware";
import { publishFlowController } from "./publish/controller";
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
import {
  validateAndDiffFlowController,
  validateAndDiffSchema,
} from "./validate/controller";
import { publishFlowSchema } from "./publish/controller";
import {
  downloadFlowSchema,
  downloadFlowSchemaController,
} from "./downloadSchema/controller";
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

router.post(
  "/:flowId/diff",
  useTeamEditorAuth,
  validate(validateAndDiffSchema),
  validateAndDiffFlowController,
);

router.get(
  "/:flowId/download-schema",
  validate(downloadFlowSchema),
  downloadFlowSchemaController,
);

export default router;
