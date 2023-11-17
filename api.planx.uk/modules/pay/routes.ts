import { Router } from "express";
import { fetchPaymentViaProxy, makePaymentViaProxy } from "./controller";
import { isTeamUsingGovPay } from "./middleware";

const router = Router();

// used by startNewPayment() in @planx/components/Pay/Public/Pay.tsx
router.post("/pay/:localAuthority", isTeamUsingGovPay, makePaymentViaProxy);

// used by refetchPayment() in @planx/components/Pay/Public/Pay.tsx
router.get(
  "/pay/:localAuthority/:paymentId",
  isTeamUsingGovPay,
  fetchPaymentViaProxy,
);

export default router;
