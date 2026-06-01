import { Router } from "express";
import {
  fetchPaymentViaProxy,
  inviteToPay,
  makeInviteToPayPaymentViaProxy,
  makePaymentViaProxy,
} from "./controller.js";
import {
  buildPaymentPayload,
  fetchPaymentRequestDetails,
  isTeamUsingGovPay,
} from "./middleware.js";
import {
  inviteToPaySchema,
  paymentProxySchema,
  paymentRequestProxySchema,
} from "./types.js";
import { validate } from "../../shared/middleware/validate.js";
import { fetchPaymentRequestViaProxy } from "./service/inviteToPay/index.js";
import {
  createStripeCheckoutSession,
  getStripeCheckoutSession,
} from "./service/stripe.js";

const router = Router();

// Stripe test-harness routes — must be registered before /pay/:localAuthority
// so Express doesn't match "stripe" as the :localAuthority param.
router.post("/pay/stripe/checkout-session", createStripeCheckoutSession);
router.get("/pay/stripe/session/:sessionId", getStripeCheckoutSession);

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
  fetchPaymentRequestDetails,
  buildPaymentPayload,
  isTeamUsingGovPay,
  validate(paymentRequestProxySchema),
  makeInviteToPayPaymentViaProxy,
);

router.get(
  "/payment-request/:paymentRequest/payment/:paymentId",
  fetchPaymentRequestDetails,
  isTeamUsingGovPay,
  validate(paymentProxySchema),
  fetchPaymentRequestViaProxy,
);

router.post(
  "/invite-to-pay/:sessionId",
  validate(inviteToPaySchema),
  inviteToPay,
);

export default router;
