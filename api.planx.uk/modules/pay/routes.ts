import { Router } from "express";
import {
  fetchPaymentViaProxy,
  inviteToPay,
  makeInviteToPayPaymentViaProxy,
  makePaymentViaProxy,
} from "./controller";
import { isTeamUsingGovPay } from "./middleware";
import {
  inviteToPaySchema,
  paymentProxySchema,
  paymentRequestProxySchema,
} from "./types";
import { validate } from "../../shared/middleware/validate";
import {
  buildPaymentPayload,
  fetchPaymentRequestDetails,
  fetchPaymentRequestViaProxy,
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
  validate(paymentRequestProxySchema),
  makeInviteToPayPaymentViaProxy,
);

router.get(
  "/payment-request/:paymentRequest/payment/:paymentId",
  fetchPaymentRequestDetails,
  validate(paymentProxySchema),
  fetchPaymentRequestViaProxy,
);

router.post(
  "/invite-to-pay/:sessionId",
  validate(inviteToPaySchema),
  inviteToPay,
);

export default router;
