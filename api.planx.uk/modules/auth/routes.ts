import { Router } from "express";
import * as Middleware from "./middleware";
import * as Controller from "./controller";

const router = Router();

router.get("/logout", Controller.logout);
router.get("/auth/login/failed", Controller.failedLogin);

// The first step in Google authentication will involve redirecting the user to google.com
router.get("/auth/google", Middleware.useGoogleAuth);

//After authorization, Google will redirect the user back to this route
router.get(
  "/auth/google/callback",
  Middleware.useGoogleCallbackAuth,
  Controller.handleSuccess,
);

export default router;
