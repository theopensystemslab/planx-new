import { Router } from "express";
import { locationSearch } from "./service/index.js";
import { classifiedRoadsSearch } from "./service/classifiedRoads.js";
import { localPlanningAuthorityLookup } from "./service/lpa.js";

const router = Router();

router.get("/gis/:localAuthority", locationSearch);
router.get("/roads", classifiedRoadsSearch);
router.get("/lpa", localPlanningAuthorityLookup);

export default router;
