import { Router } from "express";
import { fetchPaymentViaProxy, makePaymentViaProxy } from "./controller";
import { isTeamUsingGovPay } from "./middleware";
import { paymentProxySchema } from "./types";
import { validate } from "../../shared/middleware/validate";

const router = Router();

router.post(
  "/pay/:localAuthority",
  isTeamUsingGovPay,
  validate(paymentProxySchema),
  makePaymentViaProxy,
);

router.get(
  "/pay/:localAuthority/:paymentId",
  isTeamUsingGovPay,
  validate(paymentProxySchema),
  fetchPaymentViaProxy,
);

export default router;
