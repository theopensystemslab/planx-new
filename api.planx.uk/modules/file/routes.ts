import { Router } from "express";

import multer from "multer";
import {
  useNoCache,
  useFilePermission,
  useTeamEditorAuth,
} from "../auth/middleware.js";
import {
  downloadFileSchema,
  privateDownloadController,
  privateUploadController,
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
  validate(downloadFileSchema),
  publicDownloadController,
);

router.get(
  "/file/private/:fileKey/:fileName",
  useNoCache,
  useFilePermission,
  validate(downloadFileSchema),
  privateDownloadController,
);

export default router;
