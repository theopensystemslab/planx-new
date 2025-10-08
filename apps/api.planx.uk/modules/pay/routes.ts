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
