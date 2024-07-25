import { Router } from "express";
import { useOrdnanceSurveyProxy } from "./controller.js";

const router = Router();

router.use("/proxy/ordnance-survey", useOrdnanceSurveyProxy);

export default router;
