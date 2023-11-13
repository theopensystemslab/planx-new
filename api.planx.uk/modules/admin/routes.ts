import { Router } from "express";
import { usePlatformAdminAuth } from "../auth/middleware";
import { getOneAppXML } from "./session/oneAppXML";
import { getBOPSPayload } from "./session/bops";
import { getCSVData, getRedactedCSVData } from "./session/csv";
import { getHTMLExport, getRedactedHTMLExport } from "./session/html";
import { generateZip } from "./session/zip";
import { getSessionSummary } from "./session/summary";
import { getDigitalPlanningApplicationPayload } from "./session/digitalPlanningData";
import { validate } from "../../shared/middleware/validate";
import { downloadFeedbackCSVSchema } from "./service/feedback/types";
import { downloadFeedbackCSV } from "./controller";

const router = Router();

router.use(usePlatformAdminAuth);
router.get(
  "/feedback",
  validate(downloadFeedbackCSVSchema),
  downloadFeedbackCSV,
);

// TODO: Split the routes below into controller and service components
router.get("/session/:sessionId/xml", getOneAppXML);
router.get("/session/:sessionId/bops", getBOPSPayload);
router.get("/session/:sessionId/csv", getCSVData);
router.get("/session/:sessionId/csv-redacted", getRedactedCSVData);
router.get("/session/:sessionId/html", getHTMLExport);
router.get("/session/:sessionId/html-redacted", getRedactedHTMLExport);
router.get("/session/:sessionId/zip", generateZip);
router.get("/session/:sessionId/summary", getSessionSummary);
router.get(
  "/session/:sessionId/digital-planning-application",
  getDigitalPlanningApplicationPayload,
);

export default router;
