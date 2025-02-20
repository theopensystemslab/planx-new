import { Router } from "express";
import { useLoggedInUserAuth } from "../auth/middleware.js";
import { getLoggedInUserDetails } from "./controller.js";

const router = Router();

router.get("/user/me", useLoggedInUserAuth, getLoggedInUserDetails);

export default router;
