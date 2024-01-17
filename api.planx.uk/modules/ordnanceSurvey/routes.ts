import cors from "cors";
import { Router } from "express";
import { useOrdnanceSurveyProxy } from "./controller";

const router = Router();

// Because this route already uses MAP_ALLOWLIST, disable global CORS checks so map repo docs and HTML templates are accessible
const osProxyCORSOptions = {
  credentials: true,
  methods: "*",
};

router.options("/proxy/ordnance-survey", cors(osProxyCORSOptions));
router.use(
  "/proxy/ordnance-survey",
  cors(osProxyCORSOptions),
  useOrdnanceSurveyProxy,
);

export default router;
