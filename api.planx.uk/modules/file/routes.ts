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
  "/private/upload",
  multer().single("file"),
  privateUploadController,
);

router.post("/public/upload", multer().single("file"), publicUploadController);

router.get("/public/:fileKey/:fileName", publicDownloadController);

router.get(
  "/private/:fileKey/:fileName",
  useFilePermission,
  privateDownloadController,
);

export default router;
