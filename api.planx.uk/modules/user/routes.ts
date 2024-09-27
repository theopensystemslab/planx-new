import { Router } from "express";
import { useLoginAuth } from "../auth/middleware.js";
import { getLoggedInUserDetails } from "./controller.js";

const router = Router();

router.get("/user/me", useLoginAuth, getLoggedInUserDetails);

export default router;
