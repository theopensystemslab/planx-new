import { Router } from "express";
import { usePlatformAdminAuth } from "../auth/middleware";
import { validate } from "../../shared/middleware/validate";
import {
  createUserSchema,
  createUser,
  deleteUserSchema,
  deleteUser,
} from "./controller";

const router = Router();

router.use("/user", usePlatformAdminAuth);
router.put("/user", validate(createUserSchema), createUser);
router.delete("/user/:email", validate(deleteUserSchema), deleteUser);

export default router;
