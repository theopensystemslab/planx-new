import { Router } from "express";

import { validate } from "../../shared/middleware/validate.js";
import {
  findLpaController,
  getPlanningConstraintsSchemaController,
} from "./controller.js";
import { classifiedRoadsSearch } from "./service/classifiedRoads.js";
import { findLpaSchema } from "./service/findLpa/types.js";
import { getPlanningConstraintsSchemaRequestSchema } from "./service/getPlanningConstraintsSchema/types.js";
import { locationSearch } from "./service/index.js";

const router = Router();

router.get("/gis/:localAuthority", locationSearch);
router.get("/roads", classifiedRoadsSearch);
router.get("/lpa", validate(findLpaSchema), findLpaController);
router.get(
  "/planning-constraints-schema",
  validate(getPlanningConstraintsSchemaRequestSchema),
  getPlanningConstraintsSchemaController,
);

export default router;
