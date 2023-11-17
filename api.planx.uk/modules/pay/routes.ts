import { Router } from "express";
import {
  fetchPaymentViaProxy,
  makeInviteToPayPaymentViaProxy,
  makePaymentViaProxy,
} from "./controller";
import { isTeamUsingGovPay } from "./middleware";
import { paymentProxySchema } from "./types";
import { validate } from "../../shared/middleware/validate";
import {
  buildPaymentPayload,
  fetchPaymentRequestDetails,
  fetchPaymentRequestViaProxy,
  inviteToPay,
} from "./service/inviteToPay";

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

router.post(
  "/payment-request/:paymentRequest/pay",
  isTeamUsingGovPay,
  fetchPaymentRequestDetails,
  buildPaymentPayload,
  makeInviteToPayPaymentViaProxy,
);

router.get(
  "/payment-request/:paymentRequest/payment/:paymentId",
  fetchPaymentRequestDetails,
  fetchPaymentRequestViaProxy,
);

router.post("/invite-to-pay/:sessionId", inviteToPay);

export default router;
