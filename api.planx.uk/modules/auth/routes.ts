import { Router } from "express";
import type { Authenticator } from "passport";
import * as Middleware from "./middleware.js";
import * as Controller from "./controller.js";

export default (passport: Authenticator): Router => {
  const router = Router();

  router.get("/auth/login/failed", Controller.failedLogin);
  router.post(
    "/auth/logout",
    Middleware.useLoggedInUserAuth,
    Controller.logout,
  );

  router.get("/auth/google", Middleware.getGoogleAuthHandler(passport));
  router.get(
    "/auth/google/callback",
    Middleware.getGoogleCallbackAuthHandler(passport),
    Controller.handleSuccess,
  );

  router.get("/auth/microsoft", Middleware.getMicrosoftAuthHandler(passport));
  router.post(
    "/auth/microsoft/callback",
    Middleware.getMicrosoftCallbackAuthHandler(passport),
    Controller.handleSuccess,
  );

  // Dummy route with no logic
  // TODO: Call isRevoked()
  router.get("/auth/validate-jwt", (_req, res) => res.status(200).send());

  return router;
};
