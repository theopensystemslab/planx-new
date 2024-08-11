import { Router } from "express";
import * as Middleware from "./middleware.js";
import * as Controller from "./controller.js";

const router = Router();

router.get("/logout", Controller.logout);
router.get("/auth/login/failed", Controller.failedLogin);
router.get("/auth/google", Middleware.useGoogleAuth);
router.get(
  "/auth/google/callback",
  Middleware.useGoogleCallbackAuth,
  Controller.handleSuccess,
);

export default router;
