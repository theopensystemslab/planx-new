import { Router } from "express";
import { locationSearch } from "./service/index.js";
import { hasArticle4Schema } from "./service/article4Schema.js";
import { classifiedRoadsSearch } from "./service/classifiedRoads.js";

const router = Router();

router.get("/gis/:localAuthority", locationSearch);
router.get("/gis/:localAuthority/article4-schema", hasArticle4Schema);
router.get("/roads", classifiedRoadsSearch);

export default router;
