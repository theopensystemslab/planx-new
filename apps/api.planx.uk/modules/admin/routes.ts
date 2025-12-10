import { Router } from "express";
import { usePlatformAdminAuth } from "../auth/middleware.js";
import { getFeedbackWithUserData } from "./feedback/feedback.js";
import { getDigitalPlanningApplicationPayload } from "./session/digitalPlanningData.js";
import { getHTMLExport } from "./session/html.js";
import { getOneAppXML } from "./session/oneAppXML.js";
import { getSessionSummary } from "./session/summary.js";
import { generateZip } from "./session/zip.js";

const router = Router();

router.use("/admin/", usePlatformAdminAuth);

// TODO: Split the routes below into controller and service components
router.get("/admin/feedback/:feedbackId", getFeedbackWithUserData);
router.get("/admin/session/:sessionId/xml", getOneAppXML);
router.get("/admin/session/:sessionId/html", getHTMLExport);
router.get("/admin/session/:sessionId/zip", generateZip);
router.get("/admin/session/:sessionId/summary", getSessionSummary);
router.get(
  "/admin/session/:sessionId/digital-planning-application",
  getDigitalPlanningApplicationPayload,
);

export default router;
