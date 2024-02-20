import { Router } from "express";
import { validate } from "../../shared/middleware/validate";
import { usePlatformAdminAuth, useTeamEditorAuth } from "../auth/middleware";
import { copyFlowController, copyFlowSchema } from "./copyFlow/controller";
import {
  copyFlowAsPortalSchema,
  copyPortalAsFlowController,
} from "./copyFlowAsPortal/controller";
import {
  downloadFlowSchema,
  downloadFlowSchemaController,
} from "./downloadSchema/controller";
import {
  findAndReplaceController,
  findAndReplaceSchema,
} from "./findReplace/controller";
import {
  flattenFlowData,
  flattenFlowDataController,
} from "./flattenFlow/controller";
import { moveFlowController, moveFlowSchema } from "./moveFlow/controller";
import { publishFlowController, publishFlowSchema } from "./publish/controller";
import {
  validateAndDiffFlowController,
  validateAndDiffSchema,
} from "./validate/controller";
const router = Router();

router.post(
  "/flows/:flowId/copy",
  useTeamEditorAuth,
  validate(copyFlowSchema),
  copyFlowController,
);

router.post(
  "/flows/:flowId/search",
  usePlatformAdminAuth,
  validate(findAndReplaceSchema),
  findAndReplaceController,
);

router.put(
  "/flows/:flowId/copy-portal/:portalNodeId",
  usePlatformAdminAuth,
  validate(copyFlowAsPortalSchema),
  copyPortalAsFlowController,
);

router.post(
  "/flows/:flowId/move/:teamSlug",
  useTeamEditorAuth,
  validate(moveFlowSchema),
  moveFlowController,
);

router.post(
  "/flows/:flowId/publish",
  useTeamEditorAuth,
  validate(publishFlowSchema),
  publishFlowController,
);

router.post(
  "/flows/:flowId/diff",
  useTeamEditorAuth,
  validate(validateAndDiffSchema),
  validateAndDiffFlowController,
);

router.get(
  "/flows/:flowId/download-schema",
  validate(downloadFlowSchema),
  downloadFlowSchemaController,
);

router.get(
  "/flows/:flowId/flatten-data",
  validate(flattenFlowData),
  flattenFlowDataController,
);

export default router;
