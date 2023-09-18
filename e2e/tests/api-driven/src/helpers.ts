import { TEST_EMAIL } from "../../ui-driven/src/helpers";
import { $admin } from "./client";

export async function createTeam() {
  return $admin.team.create({
    name: "E2E Test Team",
    slug: "E2E",
    logo: "https://raw.githubusercontent.com/theopensystemslab/planx-team-logos/main/planx-testing.svg",
    primaryColor: "#444444",
    submissionEmail: TEST_EMAIL,
    homepage: "planx.uk",
  });
}

export async function createUser() {
  return $admin.user.create({
    firstName: "Test",
    lastName: "Test",
    email: TEST_EMAIL,
  });
}

export async function tearDownTestContext({
  teamId,
  userId,
  flowId,
  publishedFlowId,
  sessionId,
  paymentRequestId,
}: {
  teamId?: number;
  userId?: number;
  flowId?: string;
  publishedFlowId?: number;
  sessionId?: string;
  paymentRequestId?: string;
}) {
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

export async function getTestUser() {
  return await $admin.user.getByEmail(TEST_EMAIL);
}
