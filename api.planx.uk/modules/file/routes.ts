import { Router } from "express";

import multer from "multer";
import { useFilePermission } from "../auth/middleware";
import {
  privateDownloadController,
  privateUploadController,
  publicDownloadController,
  publicUploadController,
} from "./controller";

const router = Router();

router.post(
  "/private-file-upload",
  multer().single("file"),
  privateUploadController,
);

router.post(
  "/public-file-upload",
  multer().single("file"),
  publicUploadController,
);

router.get("/file/public/:fileKey/:fileName", publicDownloadController);

router.get(
  "/file/private/:fileKey/:fileName",
  useFilePermission,
  privateDownloadController,
);

export default router;
