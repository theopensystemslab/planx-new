import { Router } from "express";
import * as Controller from "./controller";
import * as AuthMiddleware from "../auth/middleware";
import { validate } from "../../shared/middleware/validate";

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
