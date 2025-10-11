import { Router } from "express";

import {
  useFilePermission,
  useNoCache,
  usePlatformAdminAuth,
  useTeamEditorAuth,
} from "../auth/middleware.js";
import {
  hostedFileSchema,
  privateDownloadController,
  privateUploadController,
  publicDeleteController,
  publicDownloadController,
  publicUploadController,
  uploadFileSchema,
} from "./controller.js";
import { validate } from "../../shared/middleware/validate.js";
import { useFileUpload } from "./middleware/useFileUpload.js";

const router = Router();

router.post(
  "/file/public/upload",
  useFileUpload,
  useTeamEditorAuth,
  validate(uploadFileSchema),
  publicUploadController,
);

router.post(
  "/file/private/upload",
  useFileUpload,
  validate(uploadFileSchema),
  privateUploadController,
);

router.get(
  "/file/public/:fileKey/:fileName",
  validate(hostedFileSchema),
  publicDownloadController,
);

router.get(
  "/file/private/:fileKey/:fileName",
  useNoCache,
  useFilePermission,
  validate(hostedFileSchema),
  privateDownloadController,
);

router.delete(
  "/file/public/:fileKey/:fileName",
  usePlatformAdminAuth,
  validate(hostedFileSchema),
  publicDeleteController,
);

export default router;
