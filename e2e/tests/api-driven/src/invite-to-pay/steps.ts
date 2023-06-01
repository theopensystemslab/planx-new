import {
  Given,
  When,
  Then,
  BeforeAll,
  After,
  AfterAll,
} from "@cucumber/cucumber";
import {
  createTeam,
  createUser,
  buildITPFlow,
  buildSessionForFlow,
  buildPaymentRequestForSession,
  markPaymentRequestAsPaid,
  getSendResponse,
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
  context.teamId = await createTeam();
  if (!context.teamId) {
    throw new Error("team not found");
  }
  context.userId = await createUser();
  if (!context.userId) {
    throw new Error("user not found");
  }
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
      context.sessionId
    );
    context.paymentRequestId = paymentRequest.id;
  }
);

When("the payment request's `paid_at` date is set", async () => {
  if (!context.paymentRequestId) {
    throw new Error("payment request not found");
  }
  await markPaymentRequestAsPaid(context.paymentRequestId);
});

Then(
  "there should be an entry in the {string} table for a successful {string} submission",
  { timeout: 6 * 10000 + 1000 },
  async (auditTable, destination) => {
    if (!context.sessionId) {
      throw new Error("session not found");
    }
    const response = await waitForResponse({
      name: `Application submission for ${destination}`,
      request: getSendResponse.bind(null, auditTable, context.sessionId!),
      retries: 5,
      delay: 10000,
    });
    return Boolean(response);
  }
);

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
