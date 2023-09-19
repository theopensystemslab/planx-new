import { strict as assert } from "node:assert";
import { Given, When, Then, Before, After, World } from "@cucumber/cucumber";
import {
  buildITPFlow,
  buildSessionForFlow,
  buildPaymentRequestForSession,
  markPaymentRequestAsPaid,
  getSendResponse,
  getSessionSubmittedAt,
  waitForResponse,
  cleanup,
  setup,
} from "./helpers";

export class CustomWorld extends World {
  teamId!: number;
  userId!: number;
  flowId?: string;
  publishedFlowId?: number;
  sessionId?: string;
  paymentRequestId?: string;
}

Before<CustomWorld>("@invite-to-pay", async function() {
  const { teamId, userId } = await setup();
  this.teamId = teamId;
  this.userId = userId;
});

After("@invite-to-pay", async function(this: CustomWorld) {
  await cleanup(this);
});

Given(
  "a session with a payment request for an invite to pay flow where {string} is a send destination", { timeout: 60 * 1000 }, 
  async function (this: CustomWorld, destination: string) {
    const { flowId, publishedFlowId } = await buildITPFlow({
      destination,
      teamId: this.teamId,
      userId: this.userId,
    });
    this.flowId = flowId;
    if (!this.flowId) {
      throw new Error("flow not found");
    }
    this.publishedFlowId = publishedFlowId;
    if (!this.publishedFlowId) {
      throw new Error("publishedFlowId not found");
    }
    this.sessionId = await buildSessionForFlow(this.flowId);
    if (!this.sessionId) {
      throw new Error("session not found");
    }
    const paymentRequest = await buildPaymentRequestForSession(
      this.sessionId,
    );
    this.paymentRequestId = paymentRequest.id;
  },
);

When("the payment request's `paid_at` date is set", async function (this: CustomWorld) {
  if (!this.paymentRequestId) {
    throw new Error("payment request not found");
  }
  const operationSucceeded = await markPaymentRequestAsPaid(
    this.paymentRequestId,
  );
  if (!operationSucceeded) {
    throw new Error("payment request was not marked as paid");
  }
});

Then(
  "there should be an audit entry for a successful {string} submission",
  { timeout: 6 * 15000 + 1000 },
  async function (this: CustomWorld, destination: string) {
    const response = await waitForResponse({
      name: `Application submission for ${destination}`,
      request: getSendResponse.bind(null, destination, this.sessionId!),
      retries: 5,
      delay: 15000,
    });
    assert(response);
  },
);

Then("the session's `submitted_at` date should be set", async function (this: CustomWorld) {
  const submittedAt = await getSessionSubmittedAt(this.sessionId!);
  assert(submittedAt);
});
