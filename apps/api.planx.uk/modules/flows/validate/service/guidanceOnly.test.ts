import type { FlowGraph } from "@opensystemslab/planx-core/types";

import { queryMock } from "../../../../tests/graphqlQueryMock.js";
import {
  isGuidanceOnlySendBlocked,
  validateGuidanceOnly,
} from "./guidanceOnly.js";

const flowWithSend: FlowGraph = {
  _root: { edges: ["send"] },
  send: { type: 650, data: { destinations: ["email"] } },
};

const flowWithoutSend: FlowGraph = {
  _root: { edges: ["notice"] },
  notice: { type: 8, data: { title: "Guidance" } },
};

const mockFlowStatus = (
  status: "online" | "offline",
  isGuidanceOnly: boolean | null,
) =>
  queryMock.mockQuery({
    name: "GetGuidanceOnlyFlowStatus",
    matchOnVariables: false,
    data: {
      flow: {
        status,
        team: { settings: { isGuidanceOnly } },
      },
    },
  });

describe("isGuidanceOnlySendBlocked", () => {
  beforeEach(() => vi.stubEnv("APP_ENVIRONMENT", "production"));
  afterEach(() => vi.unstubAllEnvs());

  it("blocks an online flow with a Send component for a guidance only team in production", async () => {
    mockFlowStatus("online", true);
    expect(await isGuidanceOnlySendBlocked("flow-id", flowWithSend)).toBe(true);
  });

  it("does not block if the flow is offline", async () => {
    mockFlowStatus("offline", true);
    expect(await isGuidanceOnlySendBlocked("flow-id", flowWithSend)).toBe(
      false,
    );
  });

  it("does not block if the team is not guidance only", async () => {
    mockFlowStatus("online", false);
    expect(await isGuidanceOnlySendBlocked("flow-id", flowWithSend)).toBe(
      false,
    );
  });

  it("does not block if the team setting is null", async () => {
    mockFlowStatus("online", null);
    expect(await isGuidanceOnlySendBlocked("flow-id", flowWithSend)).toBe(
      false,
    );
  });

  it("does not block a flow without a Send component", async () => {
    mockFlowStatus("online", true);
    expect(await isGuidanceOnlySendBlocked("flow-id", flowWithoutSend)).toBe(
      false,
    );
  });

  it("does not block outside of production", async () => {
    vi.stubEnv("APP_ENVIRONMENT", "staging");
    mockFlowStatus("online", true);
    expect(await isGuidanceOnlySendBlocked("flow-id", flowWithSend)).toBe(
      false,
    );
  });
});

describe("validateGuidanceOnly", () => {
  beforeEach(() => vi.stubEnv("APP_ENVIRONMENT", "production"));
  afterEach(() => vi.unstubAllEnvs());

  it("returns a failing check when blocked", async () => {
    mockFlowStatus("online", true);
    const result = await validateGuidanceOnly("flow-id", flowWithSend);
    expect(result).toMatchObject({ title: "Guidance only", status: "Fail" });
  });

  it("returns nothing when not blocked", async () => {
    mockFlowStatus("offline", true);
    expect(await validateGuidanceOnly("flow-id", flowWithSend)).toBeUndefined();
  });
});
