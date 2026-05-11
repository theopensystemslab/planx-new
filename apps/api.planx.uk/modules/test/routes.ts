import { Router } from "express";
import { testAirbrake, testSessionMethods } from "./controller.js";

const router = Router();

// in order to test the session setup, we need a dedicated test route
router.get("/test-session", testSessionMethods);

// trigger a test error to verify Airbrake source maps are working
router.get("/test-airbrake", testAirbrake);

export default router;
