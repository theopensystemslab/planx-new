import { Router } from "express";

import { componentGuideController } from "./controller.js";

const router = Router();

router.get("/notion/component-guide", componentGuideController);

export default router;
