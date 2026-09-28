import { strict as assert } from "node:assert";

import { After, Given, Then, When, World } from "@cucumber/cucumber";
import type Stripe from "stripe";

import {
  buildSessionWithFees,
  cleanup,
  connectStripeAccount,
  type FeeCase,
  getConnectedAccountId,
  payViaStripeCheckout,
  setupTeam,
  toFeeCase,
} from "./helpers.js";

export class CustomWorld extends World {
  teamId!: number;
  userId!: number;
  flowId?: string;
  sessionId?: string;
  feeCase?: FeeCase;
  paymentIntent?: Stripe.PaymentIntent;
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

When(
  "the applicant pays via Stripe Checkout",
  { timeout: 30 * 1000 },
  async function (this: CustomWorld) {
    this.paymentIntent = await payViaStripeCheckout({
      flowId: this.flowId!,
      sessionId: this.sessionId!,
      feeCase: this.feeCase!,
    });
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
