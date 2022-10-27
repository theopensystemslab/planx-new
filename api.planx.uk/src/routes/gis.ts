import express from "express";
import { locationSearch } from "../gis/index";
import oAuthRouter from "./oauth";

let router = express.Router();

router.use("/gis", oAuthRouter);

router.get("/gis", (_req, _res, next) => {
  return next({
    status: 400,
    message: "Please specify a local authority",
  });
});

router.get("/gis/:localAuthority", locationSearch());

export default router;
