import { Router } from "express";
import { testSessionMethods } from "./controller";

const router = Router();

// in order to test the session setup, we need a dedicated test route
router.get("/test-session", testSessionMethods);

export default router;
