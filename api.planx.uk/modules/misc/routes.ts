import { Router } from "express";
import { useLoginAuth } from "../auth/middleware";
import { getLoggedInUserDetails } from "./controller";

const router = Router();

router.get("/me", useLoginAuth, getLoggedInUserDetails);

export default router;