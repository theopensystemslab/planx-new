import { Router } from "express";

import { osCors } from "../../cors.js";
import { useOrdnanceSurveyProxy } from "./controller.js";

const router = Router();

router.use("/proxy/ordnance-survey", osCors, useOrdnanceSurveyProxy);

export default router;
