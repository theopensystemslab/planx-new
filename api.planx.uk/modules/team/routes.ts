import { Router } from "express";
import * as Controller from "./controller.js";
import * as AuthMiddleware from "../auth/middleware.js";
import { validate } from "../../shared/middleware/validate.js";

const router = Router();

router.use("/team/", AuthMiddleware.usePlatformAdminAuth);
router.put(
  "/team/:teamSlug/add-member",
  validate(Controller.upsertMemberSchema),
  Controller.addMember,
);
router.patch(
  "/team/:teamSlug/change-member-role",
  validate(Controller.upsertMemberSchema),
  Controller.changeMemberRole,
);
router.delete(
  "/team/:teamSlug/remove-member",
  validate(Controller.removeMemberSchema),
  Controller.removeMember,
);

export default router;
