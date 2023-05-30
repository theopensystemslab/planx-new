import { Given, When, Then } from "@cucumber/cucumber";
import type { Session, PaymentRequest } from "@opensystemslab/planx-core/types";
import {
  buildITPFlowWithDestination,
  buildSessionForFlow,
  buildPaymentRequestForSession,
  setSessionPaidAtToNow,
  getSendResponse,
} from "./helpers";

const context: {
  flow?: { id: string };
  session?: Session;
  paymentRequest?: PaymentRequest;
} = {};

Given(
  "a session with a payment request for an invite to pay flow where {string} is a send destination",
  async (destination) => {
    context.flow = await buildITPFlowWithDestination(destination);
    if (!context.flow) {
      throw new Error("flow not found");
    }
    context.session = await buildSessionForFlow(context.flow.id);
    if (!context.session) {
      throw new Error("session not found");
    }
    context.paymentRequest = await buildPaymentRequestForSession(
      context.session.id
    );
  }
);

When("the session's `paid_at` date is modified", async () => {
  if (!context.session) {
    throw new Error("session not found");
  }
  await setSessionPaidAtToNow(context.session.id);
});

Then(
  "there should be an entry in the {string} table for a successful {string} submission",
  async (auditTable, _destination) => {
    if (!context.session) {
      throw new Error("session not found");
    }
    const response = await getSendResponse(auditTable, context.session.id);
    return Boolean(response);
  }
);
