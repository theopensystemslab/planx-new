import { Router } from "express";
import { createSendEvents } from "./service/createSendEvents";
import { useHasuraAuth } from "../auth/middleware";
import { sendToBOPS } from "./service/bops";
import { sendToUniform } from "./service/uniform";
import { downloadApplicationFiles, sendToEmail } from "./service/email";

const router = Router();

router.post("/create-send-events/:sessionId", createSendEvents);
router.post("/bops/:localAuthority", useHasuraAuth, sendToBOPS);
router.post("/uniform/:localAuthority", useHasuraAuth, sendToUniform);
router.post("/email-submission/:localAuthority", useHasuraAuth, sendToEmail);
router.get("/download-application-files/:sessionId", downloadApplicationFiles);

export default router;
