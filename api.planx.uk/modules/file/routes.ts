import { Router } from "express";

import multer from "multer";
import { useFilePermission } from "../auth/middleware";
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
  "/private/upload",
  multer().single("file"),
  validate(uploadFileSchema),
  privateUploadController,
);

router.post(
  "/public/upload",
  multer().single("file"),
  validate(uploadFileSchema),
  publicUploadController,
);

router.get(
  "/public/:fileKey/:fileName",
  validate(downloadFileSchema),
  publicDownloadController,
);

router.get(
  "/private/:fileKey/:fileName",
  useFilePermission,
  validate(downloadFileSchema),
  privateDownloadController,
);

export default router;
