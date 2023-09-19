import { TEST_EMAIL } from "../../ui-driven/src/helpers";
import { $admin } from "./client";

export function createTeam(args?: Partial<Parameters<typeof $admin.team.create>[0]>) {
  return safely(() => $admin.team.create({
    name: "E2E Test Team",
    slug: "E2E",
    logo: "https://raw.githubusercontent.com/theopensystemslab/planx-team-logos/main/planx-testing.svg",
    primaryColor: "#444444",
    submissionEmail: TEST_EMAIL,
    homepage: "planx.uk",
    ...args,
  }));
}

export function createUser(args?: Partial<Parameters<typeof $admin.user.create>[0]>) {
  return safely(() => $admin.user.create({
    firstName: "Test",
    lastName: "Test",
    email: TEST_EMAIL,
    ...args,
  }));
}

export function createFlow(args: Omit<Parameters<typeof $admin.flow.create>[0], "data">) {
  return safely(() => $admin.flow.create({
    data: { dummy: "flowData "},
    ...args,
  }))
}

/**
 * Error handling boilerplate for client functions
 */
export function safely<T extends () => ReturnType<T>>(callback: T) {
  const result = callback();
  if (!result) {
    throw new Error("Error setting up E2E test");
  }
  return result;
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

export async function getUser(email: string) {
  return await $admin.user.getByEmail(email);
}
