import { Router } from "express";
import { locationSearch } from "./service/index.js";
import { classifiedRoadsSearch } from "./service/classifiedRoads.js";

const router = Router();

router.get("/gis/:localAuthority", locationSearch);
router.get("/roads", classifiedRoadsSearch);

export default router;
