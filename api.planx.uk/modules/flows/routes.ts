import { Router } from "express";
import { validate } from "../../shared/middleware/validate.js";
import {
  useLoggedInUserAuth,
  usePlatformAdminAuth,
  useTeamEditorAuth,
} from "../auth/middleware.js";
import { copyFlowController, copyFlowSchema } from "./copyFlow/controller.js";
import {
  copyFlowAsPortalSchema,
  copyPortalAsFlowController,
} from "./copyFlowAsPortal/controller.js";
import {
  createFlowController,
  createFlowSchema,
} from "./createFlow/controller.js";
import {
  createFlowFromTemplateController,
  createFlowFromTemplateSchema,
} from "./createFlowFromTemplate/controller.js";
import {
  downloadFlowSchema,
  downloadFlowSchemaController,
} from "./downloadSchema/controller.js";
import {
  findAndReplaceController,
  findAndReplaceSchema,
} from "./findReplace/controller.js";
import {
  flattenFlowData,
  flattenFlowDataController,
} from "./flattenFlow/controller.js";
import { moveFlowController, moveFlowSchema } from "./moveFlow/controller.js";
import {
  publishFlowController,
  publishFlowSchema,
} from "./publish/controller.js";
import {
  updateTemplatedFlowController,
  updateTemplatedFlowEventSchema,
} from "./updateTemplatedFlow/controller.js";
import {
  validateAndDiffFlowController,
  validateAndDiffSchema,
} from "./validate/controller.js";

const router = Router();

router.post(
  "/flows/create",
  useTeamEditorAuth,
  validate(createFlowSchema),
  createFlowController,
);

router.post(
  "/flows/create-from-template/:templateId",
  useTeamEditorAuth,
  validate(createFlowFromTemplateSchema),
  createFlowFromTemplateController,
);

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
  useLoggedInUserAuth,
  validate(downloadFlowSchema),
  downloadFlowSchemaController,
);

router.get(
  "/flows/:flowId/flatten-data",
  validate(flattenFlowData),
  flattenFlowDataController,
);

router.post(
  "/flows/:sourceFlowId/update-templated-flow/:templatedFlowId",
  validate(updateTemplatedFlowEventSchema),
  updateTemplatedFlowController,
);

export default router;
