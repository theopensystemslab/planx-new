import { Router } from "express";
import { useLoginAuth } from "../auth/middleware";
import { getLoggedInUserDetails, healthCheck } from "./controller";

const router = Router();

router.get("/", healthCheck);
router.get("/me", useLoginAuth, getLoggedInUserDetails);

export default router;
