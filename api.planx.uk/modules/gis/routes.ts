import { Router } from "express";
import { locationSearch } from "./service";
import { classifiedRoadsSearch } from "./service/classifiedRoads";

const router = Router();

router.get("/gis/:localAuthority", locationSearch);
router.get("/roads", classifiedRoadsSearch);

export default router;
