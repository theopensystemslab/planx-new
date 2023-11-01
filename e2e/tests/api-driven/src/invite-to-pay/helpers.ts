import { CustomWorld } from "./steps";
import axios from "axios";
import { readFileSync } from "node:fs";
import type {
  FlowGraph,
  PaymentRequest,
} from "@opensystemslab/planx-core/types";
import {
  inviteToPayFlowGraph,
  sendNodeWithDestination,
  mockBreadcrumbs,
  mockPassport,
} from "./mocks";
import { $admin } from "../client";
import { TEST_EMAIL } from "../../../ui-driven/src/globalHelpers";
import { createTeam, createUser } from "../globalHelpers";

export async function setUpMocks() {
  const serverMockFile = readFileSync(`${__dirname}/mocks/server-mocks.yaml`);
  return axios({
    method: "POST",
    url: `${process.env.E2E_MOCK_SERVER_INTERFACE}/mocks?reset=true`,
    headers: {
      "Content-Type": "application/x-yaml",
    },
    data: serverMockFile,
  });
}

export async function buildITPFlow({
  userId,
  teamId,
  destination,
}: {
  destination: string;
  userId: number;
  teamId: number;
}): Promise<{ flowId: string; publishedFlowId: number }> {
  const sendNode = sendNodeWithDestination(destination);
  const flowGraph: FlowGraph = {
    ...inviteToPayFlowGraph,
    Send: sendNode,
  };
  const flowId: string = await $admin.flow.create({
    teamId,
    slug: `test-invite-to-pay-flow-with-send-to-${destination.toLowerCase()}`,
    data: flowGraph,
  });
  const publishedFlowId = await $admin.flow.publish({
    flow: { id: flowId, data: flowGraph },
    publisherId: userId,
  });
  return { flowId, publishedFlowId };
}

export async function buildSessionForFlow(flowId: string): Promise<string> {
  return $admin.session.create({
    flowId,
    data: {
      breadcrumbs: mockBreadcrumbs,
      passport: mockPassport,
    },
  });
}

export async function buildPaymentRequestForSession(
  sessionId: string,
): Promise<PaymentRequest> {
  await $admin.session.lock(sessionId);
  return $admin.paymentRequest.create({
    sessionId,
    applicantName: "Agent",
    payeeName: "Nominee",
    payeeEmail: TEST_EMAIL,
    sessionPreviewKeys: [["_address", "title"], ["proposal.projectType"]],
  });
}

export async function markPaymentRequestAsPaid(
  paymentRequestId: string,
): Promise<boolean> {
  return await $admin.paymentRequest._markAsPaid(paymentRequestId);
}

export async function getSendResponse(
  destination: string,
  sessionId: string,
): Promise<unknown> {
  switch (destination.toLowerCase()) {
    case "bops":
      return $admin.application.bopsResponse(sessionId);
    case "email":
      return $admin.application.emailResponse(sessionId);
    case "uniform":
      return $admin.application.uniformResponse(sessionId);
    default:
      throw new Error("unhandled audit table");
  }
}

export async function waitForResponse({
  name,
  request,
  retries,
  delay,
}: {
  name: string;
  request: () => Promise<unknown | undefined>;
  retries: number;
  delay: number;
}) {
  console.log(`waiting for response for ${name}`);
  for (let tryCount = retries; tryCount >= 0; tryCount--) {
    await new Promise((resolve) => setTimeout(resolve, delay));
    const response = await request();
    if (response !== null) {
      console.log(`got response:\n\t${JSON.stringify(response)}\n`);
      return response;
    }
    console.log(`no response yet, retries remaining ${tryCount}`);
  }
  console.log(); // newline
  throw new Error("awaited response not returned");
}

export async function getSessionSubmittedAt(
  sessionId: string,
): Promise<string | undefined> {
  const detailedSession = await $admin.session.findDetails(sessionId);
  return detailedSession?.submittedAt;
}

export async function cleanup({
  teamId,
  userId,
  flowId,
  publishedFlowId,
  sessionId,
  paymentRequestId,
}: CustomWorld) {
  if (paymentRequestId) {
    await $admin.paymentRequest._destroy(paymentRequestId);
  }
  if (sessionId) {
    await $admin.application._destroyAll(sessionId);
    await $admin.session._destroy(sessionId);
  }
  if (publishedFlowId) {
    await $admin.flow._destroyPublished(publishedFlowId);
  }
  if (flowId) {
    await $admin.flow._destroy(flowId);
  }
  if (userId) {
    await $admin.user._destroy(userId);
  }
  if (teamId) {
    await $admin.team._destroy(teamId);
  }
}

export const setup = async () => {
  await setUpMocks();
  const world = {
    teamId: await createTeam(),
    userId: await createUser(),
  };

  return world;
};
