import { Router } from "express";
import { useOrdnanceSurveyProxy } from "./controller.js";
import { osCors } from "../../cors.js";

const router = Router();

router.use("/proxy/ordnance-survey", osCors, useOrdnanceSurveyProxy);

export default router;
