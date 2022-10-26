import express from "express";
import { useHasuraAuth, useSendEmailAuth } from "../auth";
import { sendToBOPS } from "../send/bops";
import { sendToUniform } from "../send/uniform";
import { sendEmailLimiter } from "../rateLimit";
import { sendSaveAndReturnEmail } from "../saveAndReturn";

let router = express.Router();

router.post("/bops/:localAuthority", useHasuraAuth, sendToBOPS);
router.post("/uniform/:localAuthority", useHasuraAuth, sendToUniform);
router.post(
  "/send-email/:template",
  sendEmailLimiter,
  useSendEmailAuth,
  sendSaveAndReturnEmail
);

export default router;
