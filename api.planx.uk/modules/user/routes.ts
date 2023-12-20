import { Router } from "express";
import { useLoginAuth, usePlatformAdminAuth } from "../auth/middleware";
import { validate } from "../../shared/middleware/validate";
import {
  createUserSchema,
  createUser,
  deleteUserSchema,
  deleteUser,
  getLoggedInUserDetails,
} from "./controller";

const router = Router();

router.put(
  "/user",
  usePlatformAdminAuth,
  validate(createUserSchema),
  createUser,
);
router.delete(
  "/user/:email",
  usePlatformAdminAuth,
  validate(deleteUserSchema),
  deleteUser,
);
router.get("/user/me", useLoginAuth, getLoggedInUserDetails);

export default router;
