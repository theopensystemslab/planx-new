import { type FullStore, useStore } from "pages/FlowEditor/lib/store";
import {
  getBasicFlowData,
  getFlowEditorData,
} from "utils/routeUtils/queryUtils";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { connectToFlowRoute } from "./-route.utils";

vi.mock("pages/FlowEditor/lib/store", () => ({
  useStore: {
    getState: vi.fn(),
    setState: vi.fn(),
  },
}));

vi.mock("utils/routeUtils/queryUtils", () => ({
  getBasicFlowData: vi.fn(),
  getFlowEditorData: vi.fn(),
}));

const mockDisconnectFromFlow = vi.fn();
const mockConnectToFlow = vi.fn().mockResolvedValue(undefined);
const mockGetFlowInformation = vi.fn();

const makeStore = (overrides: Partial<FullStore> = {}): FullStore =>
  ({
    id: "",
    disconnectFromFlow: mockDisconnectFromFlow,
    connectToFlow: mockConnectToFlow,
    getFlowInformation: mockGetFlowInformation,
    setOrderedFlow: vi.fn(),
    ...overrides,
  }) as unknown as FullStore;

describe("connectToFlowRoute (ShareDB connection guard)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getFlowEditorData).mockResolvedValue({
      id: "flow-uuid",
      flowStatus: "online",
      isFlowPublished: false,
      isTemplate: false,
      isService: true,
      templatedFrom: "template-uuid",
      template: undefined,
    });
  });

  /**
   * Routes from lambeth/someFlow → berks/someFlow
   */
  it("reconnects when the same slug resolves to a different document on another team", async () => {
    vi.mocked(useStore.getState).mockReturnValue(
      makeStore({ id: "lambeth-someFlow-uuid" }),
    );
    vi.mocked(getBasicFlowData).mockResolvedValue({
      id: "berks-someFlow-uuid",
      name: "Some Flow",
    });

    await connectToFlowRoute("berks", "someFlow");

    expect(mockDisconnectFromFlow).toHaveBeenCalledOnce();
    expect(mockConnectToFlow).toHaveBeenCalledWith("berks-someFlow-uuid");
  });

  /**
   * Routes from lambeth/confirmation-pages → /lambeth → /barnet → barnet/confirmation-pages
   */
  it("reconnects after visiting the team dashboard", async () => {
    vi.mocked(useStore.getState).mockReturnValue(
      makeStore({ id: "lambeth-confirmation-pages-uuid" }),
    );
    vi.mocked(getBasicFlowData).mockResolvedValue({
      id: "barnet-confirmation-pages-uuid",
      name: "Confirmation Pages",
    });

    await connectToFlowRoute("barnet", "confirmation-pages");

    expect(mockDisconnectFromFlow).toHaveBeenCalledOnce();
    expect(mockConnectToFlow).toHaveBeenCalledWith(
      "barnet-confirmation-pages-uuid",
    );
  });

  /**
   * Routes from lambeth/someFlow → lambeth/someFlow,nestedFlowId
   */
  it("does not reconnect when already subscribed to the same document", async () => {
    vi.mocked(useStore.getState).mockReturnValue(
      makeStore({ id: "lambeth-someFlow-uuid" }),
    );
    vi.mocked(getBasicFlowData).mockResolvedValue({
      id: "lambeth-someFlow-uuid",
      name: "Some Flow",
    });

    await connectToFlowRoute("lambeth", "someFlow");

    expect(mockDisconnectFromFlow).not.toHaveBeenCalled();
    expect(mockConnectToFlow).not.toHaveBeenCalled();
  });

  /**
   * Routes from lambeth/flow-a → lambeth/flow-b
   */
  it("reconnects when navigating to a different flow on the same team", async () => {
    vi.mocked(useStore.getState).mockReturnValue(
      makeStore({ id: "lambeth-flow-a-uuid" }),
    );
    vi.mocked(getBasicFlowData).mockResolvedValue({
      id: "lambeth-flow-b-uuid",
      name: "Flow B",
    });

    await connectToFlowRoute("lambeth", "flow-b");

    expect(mockDisconnectFromFlow).toHaveBeenCalledOnce();
    expect(mockConnectToFlow).toHaveBeenCalledWith("lambeth-flow-b-uuid");
  });
});
