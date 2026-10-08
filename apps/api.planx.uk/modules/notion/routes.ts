import { Router } from "express";

import { validate } from "../../shared/middleware/validate.js";
import { useLoggedInUserAuth } from "../auth/middleware.js";
import { getNotionPageController } from "./controller.js";
import { getNotionPageSchema } from "./types.js";

const router = Router();

router.get(
  "/notion/page/:pageId",
  useLoggedInUserAuth,
  validate(getNotionPageSchema),
  getNotionPageController,
);

export default router;
