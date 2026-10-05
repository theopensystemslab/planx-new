import { strict as assert } from "node:assert";

import {
  After,
  type DataTable,
  Given,
  Then,
  When,
  World,
} from "@cucumber/cucumber";
import type { PaymentMetadata } from "@opensystemslab/planx-core/types";
import type Stripe from "stripe";

import { completeStripeCheckoutSession } from "../../../../shared/stripe/completeCheckoutSession.js";
import {
  buildSessionWithFees,
  cleanup,
  connectStripeAccount,
  createCheckoutSession,
  type FeeCase,
  getConnectedAccountId,
  getExpectedPaymentMetadata,
  resolvePayComponentMetadata,
  setupTeam,
  toFeeCase,
  validateSession,
  type ValidateSessionResponse,
  waitForDestinationPaymentMetadata,
  waitForStripeAuditTrail,
  waitForStripePaymentStatus,
} from "./helpers.js";

export class CustomWorld extends World {
  teamId!: number;
  userId!: number;
  flowId?: string;
  sessionId?: string;
  feeCase?: FeeCase;
  checkoutSessionId?: string;
  paymentIntent?: Stripe.PaymentIntent;
  validateSessionResponse?: ValidateSessionResponse;
  payComponentMetadata?: PaymentMetadata[];
}

After("@stripe", async function (this: CustomWorld) {
  await cleanup(this);
});

Given(
  "a team on Stripe with a connected account",
  async function (this: CustomWorld) {
    const { teamId, userId } = await setupTeam();
    this.teamId = teamId;
    this.userId = userId;

    await connectStripeAccount(teamId);
  },
);

Given(
  "a session with {string}",
  async function (this: CustomWorld, fee: string) {
    this.feeCase = toFeeCase(fee);
    const { flowId, sessionId } = await buildSessionWithFees({
      teamId: this.teamId,
      userId: this.userId,
      feeCase: this.feeCase,
    });
    this.flowId = flowId;
    this.sessionId = sessionId;
  },
);

Given(
  "the Pay component has metadata:",
  function (this: CustomWorld, table: DataTable) {
    this.payComponentMetadata = table.hashes().map(({ key, value, type }) => ({
      key,
      value,
      type: type as PaymentMetadata["type"],
    }));
  },
);

When(
  "the applicant pays via Stripe Checkout",
  { timeout: 30 * 1000 },
  async function (this: CustomWorld) {
    this.checkoutSessionId = await createCheckoutSession({
      flowId: this.flowId!,
      sessionId: this.sessionId!,
      metadata:
        this.payComponentMetadata &&
        resolvePayComponentMetadata({
          metadata: this.payComponentMetadata,
          feeCase: this.feeCase!,
        }),
    });
    this.paymentIntent = await completeStripeCheckoutSession(
      this.checkoutSessionId,
    );
  },
);

When(
  "the applicant pays via Stripe Checkout with a declined card",
  { timeout: 30 * 1000 },
  async function (this: CustomWorld) {
    this.checkoutSessionId = await createCheckoutSession({
      flowId: this.flowId!,
      sessionId: this.sessionId!,
    });
    this.paymentIntent = await completeStripeCheckoutSession(
      this.checkoutSessionId,
      "declined",
    );
  },
);

When(
  "the applicant leaves Stripe Checkout without paying",
  async function (this: CustomWorld) {
    this.checkoutSessionId = await createCheckoutSession({
      flowId: this.flowId!,
      sessionId: this.sessionId!,
    });
  },
);

When(
  "the applicant returns to their saved session",
  async function (this: CustomWorld) {
    this.validateSessionResponse = await validateSession(this.sessionId!);
  },
);

When(
  "the applicant retries with a valid card",
  { timeout: 30 * 1000 },
  async function (this: CustomWorld) {
    this.paymentIntent = await completeStripeCheckoutSession(
      this.checkoutSessionId!,
    );
  },
);

Then(
  "the payment is a destination charge to the council's connected account",
  function (this: CustomWorld) {
    const { status, on_behalf_of, transfer_data, metadata } =
      this.paymentIntent!;

    assert.equal(status, "succeeded");
    assert.equal(on_behalf_of, getConnectedAccountId());
    assert.equal(transfer_data?.destination, getConnectedAccountId());
    assert.equal(metadata.sessionId, this.sessionId);
  },
);

Then(
  "the applicant is charged {int} pence",
  function (this: CustomWorld, amount: number) {
    assert.equal(this.paymentIntent!.amount, amount);
  },
);

Then(
  "PlanX keeps {int} pence as the application fee",
  function (this: CustomWorld, applicationFee: number) {
    assert.equal(this.paymentIntent!.application_fee_amount, applicationFee);
  },
);

Then(
  "the payment status audit trail is:",
  { timeout: 30 * 1000 },
  async function (this: CustomWorld, table: DataTable) {
    const stripeIds: Record<string, string | undefined> = {
      "Checkout Session": this.checkoutSessionId,
      PaymentIntent: this.paymentIntent?.id,
    };

    const expected = Object.fromEntries(
      table.hashes().map(({ status, keyedBy }) => {
        const stripeId = stripeIds[keyedBy];
        assert.ok(stripeId, `No ${keyedBy} id for this scenario`);
        return [status, stripeId];
      }),
    );

    await waitForStripeAuditTrail({
      sessionId: this.sessionId!,
      expected,
    });
  },
);

Then(
  "the succeeded payment status records the amount, fee breakdown and metadata",
  { timeout: 30 * 1000 },
  async function (this: CustomWorld) {
    const { stripePaymentId, amount, feeBreakdown, metadata } =
      await waitForStripePaymentStatus({
        sessionId: this.sessionId!,
        stripeStatus: "succeeded",
      });

    assert.equal(stripePaymentId, this.paymentIntent!.id);
    assert.equal(amount, this.paymentIntent!.amount);
    assert.equal(
      feeBreakdown?.amount.payable,
      this.paymentIntent!.amount / 100,
    );
    assert.equal(metadata?.sessionId, this.sessionId);
  },
);

Then(
  "reconciliation is skipped as a payment has started",
  function (this: CustomWorld) {
    const { message, changesFound, reconciledSessionData } =
      this.validateSessionResponse!;

    assert.equal(message, "Payment process initiated, skipping reconciliation");
    assert.equal(changesFound, null);
    assert.deepEqual(reconciledSessionData, {
      id: this.sessionId,
      breadcrumbs: {},
    });
  },
);

Then(
  "the session is reconciled with no content changes",
  function (this: CustomWorld) {
    const { message, changesFound } = this.validateSessionResponse!;

    assert.equal(message, "No content changes since last save point");
    assert.equal(changesFound, false);
  },
);

Then(
  "the payment records the Pay component's metadata and the PlanX session",
  function (this: CustomWorld) {
    assert.deepEqual(
      this.paymentIntent!.metadata,
      getExpectedPaymentMetadata({
        flowId: this.flowId!,
        sessionId: this.sessionId!,
      }),
    );
  },
);

Then(
  "the payment has {string} metadata of {string}",
  function (this: CustomWorld, key: string, value: string) {
    assert.equal(this.paymentIntent!.metadata[key], value);
  },
);

Then(
  "the council's payment has the same metadata",
  { timeout: 30 * 1000 },
  async function (this: CustomWorld) {
    const destinationMetadata = await waitForDestinationPaymentMetadata(
      this.paymentIntent!.id,
    );
    assert.deepEqual(destinationMetadata, this.paymentIntent!.metadata);
  },
);
