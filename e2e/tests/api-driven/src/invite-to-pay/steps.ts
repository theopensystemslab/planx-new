import { strict as assert } from "node:assert";
import {
  Given,
  When,
  Then,
  BeforeAll,
  After,
  AfterAll,
} from "@cucumber/cucumber";
import {
  setUpMocks,
  createTeam,
  createUser,
  buildITPFlow,
  buildSessionForFlow,
  buildPaymentRequestForSession,
  markPaymentRequestAsPaid,
  getSendResponse,
  getSessionSubmittedAt,
  waitForResponse,
  tearDownTestContext,
} from "./helpers";

const context: {
  teamId?: number;
  userId?: number;
  flowId?: string;
  publishedFlowId?: number;
  sessionId?: string;
  paymentRequestId?: string;
} = {};

BeforeAll(async () => {
  await setUpMocks();
  context.teamId = await createTeam();
  if (!context.teamId) {
    throw new Error("team not found");
  }
  context.userId = await createUser();
  if (!context.userId) {
    throw new Error("user not found");
  }
});

// tear down each example but not user and team
After(async () => {
  await tearDownTestContext({
    flowId: context.flowId,
    publishedFlowId: context.publishedFlowId,
    sessionId: context.sessionId,
    paymentRequestId: context.paymentRequestId,
  });
});

// tear down everything
AfterAll(async () => {
  await tearDownTestContext(context);
});

Given(
  "a session with a payment request for an invite to pay flow where {string} is a send destination",
  async (destination) => {
    const { flowId, publishedFlowId } = await buildITPFlow({
      destination,
      teamId: context.teamId!,
      userId: context.userId!,
    });
    context.flowId = flowId;
    if (!context.flowId) {
      throw new Error("flow not found");
    }
    context.publishedFlowId = publishedFlowId;
    if (!context.publishedFlowId) {
      throw new Error("publishedFlowId not found");
    }
    context.sessionId = await buildSessionForFlow(context.flowId);
    if (!context.sessionId) {
      throw new Error("session not found");
    }
    const paymentRequest = await buildPaymentRequestForSession(
      context.sessionId,
    );
    context.paymentRequestId = paymentRequest.id;
  },
);

When("the payment request's `paid_at` date is set", async () => {
  if (!context.paymentRequestId) {
    throw new Error("payment request not found");
  }
  const operationSucceeded = await markPaymentRequestAsPaid(
    context.paymentRequestId,
  );
  if (!operationSucceeded) {
    throw new Error("payment request was not marked as paid");
  }
});

Then(
  "there should be an audit entry for a successful {string} submission",
  { timeout: 6 * 15000 + 1000 },
  async (destination) => {
    const response = await waitForResponse({
      name: `Application submission for ${destination}`,
      request: getSendResponse.bind(null, destination, context.sessionId!),
      retries: 5,
      delay: 15000,
    });
    assert(response);
  },
);

Then("the session's `submitted_at` date should be set", async () => {
  const submittedAt = await getSessionSubmittedAt(context.sessionId!);
  assert(submittedAt);
});
