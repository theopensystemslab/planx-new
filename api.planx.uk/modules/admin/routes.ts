import { Router } from "express";
import { usePlatformAdminAuth } from "../auth/middleware";
import { getOneAppXML } from "./session/oneAppXML";
import { getCSVData, getRedactedCSVData } from "./session/csv";
import { getHTMLExport, getRedactedHTMLExport } from "./session/html";
import { generateZip } from "./session/zip";
import { getSessionSummary } from "./session/summary";
import { getDigitalPlanningApplicationPayload } from "./session/digitalPlanningData";

const router = Router();

router.use("/admin/", usePlatformAdminAuth);

// TODO: Split the routes below into controller and service components
router.get("/admin/session/:sessionId/xml", getOneAppXML);
router.get("/admin/session/:sessionId/csv", getCSVData);
router.get("/admin/session/:sessionId/csv-redacted", getRedactedCSVData);
router.get("/admin/session/:sessionId/html", getHTMLExport);
router.get("/admin/session/:sessionId/html-redacted", getRedactedHTMLExport);
router.get("/admin/session/:sessionId/zip", generateZip);
router.get("/admin/session/:sessionId/summary", getSessionSummary);
router.get(
  "/admin/session/:sessionId/digital-planning-application",
  getDigitalPlanningApplicationPayload,
);

export default router;
