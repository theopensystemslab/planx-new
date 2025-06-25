import { Router } from "express";
import { validate } from "../../shared/middleware/validate.js";
import { loginSchema } from "./types.js";
import { loginController } from "./controller.js";

const router = Router();

router.post("/lps/login", validate(loginSchema), loginController);

export default router;
