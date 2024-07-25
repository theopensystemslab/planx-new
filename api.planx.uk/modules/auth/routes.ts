import { Router } from "express";
import { Authenticator } from "passport";

import * as Middleware from "./middleware";
import * as Controller from "./controller";

export default (passport: Authenticator): Router => {
  const router = Router();

  router.get("/logout", Controller.logout);
  router.get("/auth/login/failed", Controller.failedLogin);
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

  return router;
};
