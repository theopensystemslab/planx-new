import { strict as assert } from "node:assert";

import { After, Given, Then, When } from "@cucumber/cucumber";

import { getStripeTestClient } from "../../../../../shared/stripe/client.js";
import { completeStripeCheckoutSession } from "../../../../../shared/stripe/completeCheckoutSession.js";
import { $admin } from "../../../client.js";
import { cleanup as cleanupSubmissions } from "../../invite-to-pay/helpers.js";
import { createCheckoutSession, toFeeCase } from "../helpers.js";
import type { CustomWorld } from "../steps.js";
import {
  buildInviteToPaySession,
  buildSubmittingInviteToPaySession,
  createPaymentRequestCheckoutSession,
  expirePaymentRequest,
  fulfilPaymentRequest,
  type FulfilResponse,
  getPaymentRequestPaymentState,
  getRefusal,
  getSessionPassportData,
  inviteNominee,
  type PaymentRequestPaymentState,
  type Refusal,
  startGovPayPayment,
  toRefusal,
  waitForPaymentRequestToBePaid,
  waitForScheduledEmailSubmissions,
} from "./helpers.js";

const STRIPE_PASSPORT_KEY = "application.fee.reference.stripe";

interface InviteToPayWorld extends CustomWorld {
  paymentRequestId?: string;
  applicantCheckoutSessionId?: string;
  paidPaymentRequest?: PaymentRequestPaymentState;
  fulfilResponse?: FulfilResponse;
  refusal?: Refusal;
}

Given(
  "an invite to pay session with {string}",
  async function (this: InviteToPayWorld, fee: string) {
    this.feeCase = toFeeCase(fee);
    const { flowId, sessionId } = await buildInviteToPaySession({
      teamId: this.teamId,
      userId: this.userId,
      feeCase: this.feeCase,
    });
    this.flowId = flowId;
    this.sessionId = sessionId;
  },
);

After(
  "@stripe-invite-to-pay-submissions",
  async function (this: InviteToPayWorld) {
    await cleanupSubmissions(this);
  },
);

Given(
  "an invite to pay session on Stripe where {string} is a send destination",
  { timeout: 60 * 1000 },
  async function (this: InviteToPayWorld, destination: string) {
    const { teamId, userId, flowId, sessionId } =
      await buildSubmittingInviteToPaySession(destination);
    this.teamId = teamId;
    this.userId = userId;
    this.flowId = flowId;
    this.sessionId = sessionId;
  },
);

Given(
  "the applicant has started paying via Stripe Checkout",
  async function (this: InviteToPayWorld) {
    this.applicantCheckoutSessionId = await createCheckoutSession({
      flowId: this.flowId!,
      sessionId: this.sessionId!,
    });
  },
);

When(
  "the applicant invites a nominee to pay",
  { timeout: 30 * 1000 },
  async function (this: InviteToPayWorld) {
    this.paymentRequestId = await inviteNominee(this.sessionId!);
  },
);

When(
  "the nominee pays via Stripe Checkout, then closes their browser without returning to PlanX",
  { timeout: 30 * 1000 },
  nomineePaysViaStripeCheckout,
);

When(
  "the nominee pays via Stripe Checkout",
  { timeout: 30 * 1000 },
  nomineePaysViaStripeCheckout,
);

async function nomineePaysViaStripeCheckout(this: InviteToPayWorld) {
  this.checkoutSessionId = await createPaymentRequestCheckoutSession(
    this.paymentRequestId!,
  );
  this.paymentIntent = await completeStripeCheckoutSession(
    this.checkoutSessionId,
  );
}

When(
  "the nominee returns to PlanX from Stripe Checkout",
  nomineeReturnsFromStripeCheckout,
);

When(
  "the nominee returns to PlanX from Stripe Checkout, without waiting for the webhook",
  nomineeReturnsFromStripeCheckout,
);

async function nomineeReturnsFromStripeCheckout(this: InviteToPayWorld) {
  this.fulfilResponse = await fulfilPaymentRequest({
    paymentRequestId: this.paymentRequestId!,
    checkoutSessionId: this.checkoutSessionId!,
  });
}

When(
  "the nominee returns to PlanX with the applicant's Checkout Session instead of their own",
  async function (this: InviteToPayWorld) {
    this.fulfilResponse = await fulfilPaymentRequest({
      paymentRequestId: this.paymentRequestId!,
      checkoutSessionId: this.applicantCheckoutSessionId!,
    });
    this.refusal = toRefusal(this.fulfilResponse);
  },
);

When(
  "the applicant tries to pay via Stripe Checkout",
  async function (this: InviteToPayWorld) {
    this.refusal = await getRefusal(() =>
      createCheckoutSession({
        flowId: this.flowId!,
        sessionId: this.sessionId!,
      }),
    );
  },
);

When(
  "the nominee tries to pay via Stripe Checkout",
  async function (this: InviteToPayWorld) {
    this.refusal = await getRefusal(() =>
      createPaymentRequestCheckoutSession(this.paymentRequestId!),
    );
  },
);

When(
  "the payment request has already been paid",
  async function (this: InviteToPayWorld) {
    await $admin.paymentRequest._markAsPaid(this.paymentRequestId!);
  },
);

When(
  "the payment request has expired",
  async function (this: InviteToPayWorld) {
    await expirePaymentRequest(this.paymentRequestId!);
  },
);

When(
  "the payment request has started a GOV.UK Pay payment",
  async function (this: InviteToPayWorld) {
    await startGovPayPayment(this.paymentRequestId!);
  },
);

Then(
  "the webhook marks the payment request as paid",
  { timeout: 30 * 1000 },
  expectPaymentRequestToBePaid,
);

Then(
  "the payment request is marked as paid",
  { timeout: 30 * 1000 },
  expectPaymentRequestToBePaid,
);

async function expectPaymentRequestToBePaid(this: InviteToPayWorld) {
  this.paidPaymentRequest = await waitForPaymentRequestToBePaid(
    this.paymentRequestId!,
  );
  assert.equal(this.paidPaymentRequest.stripePaymentId, this.paymentIntent!.id);
}

Then(
  "the payment request is not paid",
  async function (this: InviteToPayWorld) {
    const { paidAt, stripePaymentId } = await getPaymentRequestPaymentState(
      this.paymentRequestId!,
    );
    assert.equal(paidAt, null);
    assert.equal(stripePaymentId, null);
  },
);

Then(
  "the paid date and payment reference are unchanged",
  async function (this: InviteToPayWorld) {
    assert.deepEqual(
      await getPaymentRequestPaymentState(this.paymentRequestId!),
      this.paidPaymentRequest,
    );
  },
);

Then(
  "the session records the payment reference",
  async function (this: InviteToPayWorld) {
    const passportData = await getSessionPassportData(this.sessionId!);
    assert.equal(passportData[STRIPE_PASSPORT_KEY], this.paymentIntent!.id);
  },
);

Then(
  "the application is scheduled for submission to the council",
  { timeout: 30 * 1000 },
  async function (this: InviteToPayWorld) {
    await waitForScheduledEmailSubmissions(this.sessionId!);
  },
);

Then(
  "the application is only scheduled for submission once",
  { timeout: 30 * 1000 },
  async function (this: InviteToPayWorld) {
    assert.equal(await waitForScheduledEmailSubmissions(this.sessionId!), 1);
  },
);

Then(
  "the payer page is told the payment request is paid",
  function (this: InviteToPayWorld) {
    assert.equal(this.fulfilResponse!.status, 200);
    assert.deepEqual(this.fulfilResponse!.data, {
      paymentStatus: "paid",
      paymentIntentId: this.paymentIntent!.id,
    });
  },
);

Then(
  "the request is refused with a {int} error: {string}",
  function (this: InviteToPayWorld, status: number, reason: string) {
    assert.equal(this.refusal!.status, status);
    assert.ok(
      this.refusal!.message.includes(reason),
      `Expected the refusal "${this.refusal!.message}" to include "${reason}"`,
    );
  },
);

Then(
  "the nominee is charged {int} pence",
  function (this: InviteToPayWorld, amount: number) {
    assert.equal(this.paymentIntent!.amount, amount);
  },
);

Then(
  "the payment is linked to the payment request",
  function (this: InviteToPayWorld) {
    assert.equal(
      this.paymentIntent!.metadata.paymentRequestId,
      this.paymentRequestId,
    );
  },
);

Then(
  "the applicant's Checkout Session is expired",
  async function (this: InviteToPayWorld) {
    const { status } = await getStripeTestClient().checkout.sessions.retrieve(
      this.applicantCheckoutSessionId!,
    );
    assert.equal(status, "expired");
  },
);
