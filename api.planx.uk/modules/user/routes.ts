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

router.use(usePlatformAdminAuth);
router.put("/", validate(createUserSchema), createUser);
router.delete("/:email", validate(deleteUserSchema), deleteUser);

export default router;
