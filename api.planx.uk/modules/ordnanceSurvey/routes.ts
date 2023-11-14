import { Router } from "express";
import { useOrdnanceSurveyProxy } from "./controller";

const router = Router();

router.use("/proxy/ordnance-survey", useOrdnanceSurveyProxy);

export default router;
