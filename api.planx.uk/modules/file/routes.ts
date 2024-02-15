import { Router } from "express";

import multer from "multer";
import {
  useNoCache,
  useFilePermission,
  useTeamEditorAuth,
} from "../auth/middleware";
import {
  downloadFileSchema,
  privateDownloadController,
  privateUploadController,
  publicDownloadController,
  publicUploadController,
  uploadFileSchema,
} from "./controller";
import { validate } from "../../shared/middleware/validate";

const router = Router();

router.post(
  "/file/public/upload",
  multer().single("file"),
  useTeamEditorAuth,
  validate(uploadFileSchema),
  publicUploadController,
);

router.post(
  "/file/private/upload",
  multer().single("file"),
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
