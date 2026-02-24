import type {
  FlowGraph,
  PaymentRequest,
} from "@opensystemslab/planx-core/types";
import axios from "axios";
import { gql } from "graphql-tag";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { $admin } from "../client.js";
import { createTeam, createUser, TEST_EMAIL } from "../globalHelpers.js";
import {
  inviteToPayFlowGraph,
  mockBreadcrumbs,
  mockPassport,
  sendNodeWithDestination,
} from "./mocks/index.js";
import { CustomWorld } from "./steps.js";

export async function setUpMocks() {
  // we can't directly access `__dirname` in ESM, so get equivalent using fileURLToPath
  const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
  const __dirname = path.dirname(__filename); // get the name of the directory

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
}): Promise<{ flowId: string }> {
  const sendNode = sendNodeWithDestination(destination);
  const flowGraph: FlowGraph = {
    ...inviteToPayFlowGraph,
    Send: sendNode,
  };
  const flowId: string = await $admin.flow.create({
    teamId,
    slug: `test-invite-to-pay-flow-with-send-to-${destination.toLowerCase()}`,
    name: `Test invite to pay flow with send to ${destination}`,
    data: flowGraph,
    status: "online",
    userId,
  });
  return { flowId };
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
  if (flowId) {
    await $admin.flow._destroyPublishedAll();
    await $admin.flow._destroy(flowId);
  }
  if (userId) {
    await $admin.user._destroy(userId);
  }
  if (teamId) {
    await cleanupSubmissionIntegration(teamId);
    await $admin.team._destroy(teamId);
  }
}

const setupMockBopsSubmissionUrl = async (teamId: number) => {
  await $admin.client.request(
    gql`
      mutation UpdateTeamIntegrationE2E(
        $stagingBopsSubmissionUrl: String
        $teamId: Int
      ) {
        update_team_integrations(
          where: { team_id: { _eq: $teamId } }
          _set: { staging_bops_submission_url: $stagingBopsSubmissionUrl }
        ) {
          affected_rows
        }
      }
    `,
    {
      teamId,
      stagingBopsSubmissionUrl: "http://mock-server:8080",
    },
  );
};

const setupSubmissionIntegration = async (
  teamId: number,
  submissionEmail: string,
) => {
  await $admin.client.request(
    gql`
      mutation InsertSubmissionIntegration(
        $teamId: Int!
        $submissionEmail: String!
      ) {
        insert_submission_integrations_one(
          object: {
            team_id: $teamId
            submission_email: $submissionEmail
            default_email: true
          }
        ) {
          id
        }
      }
    `,
    {
      teamId,
      submissionEmail,
    },
  );
};

const cleanupSubmissionIntegration = async (teamId: number) => {
  await $admin.client.request(
    gql`
      mutation DeleteSubmissionIntegrations($teamId: Int!) {
        delete_submission_integrations(where: { team_id: { _eq: $teamId } }) {
          affected_rows
        }
      }
    `,
    { teamId },
  );
};

export const setup = async () => {
  await setUpMocks();

  const teamId = await createTeam({
    settings: { referenceCode: "ABC" },
  });
  const userId = await createUser();
  await setupMockBopsSubmissionUrl(teamId);
  await setupSubmissionIntegration(teamId, TEST_EMAIL);
  const world = { teamId, userId };

  return world;
};
