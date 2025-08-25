import { Router } from "express";
import { locationSearch } from "./service/index.js";
import { classifiedRoadsSearch } from "./service/classifiedRoads.js";
import { validate } from "../../shared/middleware/validate.js";
import { findLpaSchema } from "./service/findLpa/types.js";
import { validateFindLpa } from "./middleware/validateFindLpa.js";
import { findLpaController } from "./controller.js";

const router = Router();

router.get("/gis/:localAuthority", locationSearch);
router.get("/roads", classifiedRoadsSearch);
router.get("/lpa", validate(findLpaSchema), validateFindLpa, findLpaController);

export default router;
