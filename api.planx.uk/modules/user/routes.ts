import { Router } from "express";
import { usePlatformAdminAuth } from "../auth/middleware";
import { validate } from "../../shared/middleware/validate";
import { createUserSchema, createUser } from "./controller";

const router = Router();

router.use(usePlatformAdminAuth);
router.put("/user", validate(createUserSchema), createUser);

export default router;
