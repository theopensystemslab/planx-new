import * as TanStackRouter from "@tanstack/react-router";
import { act, renderHook } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  RecentFlowsProvider,
  startNewRecentFlowsJourney,
  useRecentFlowsContext,
} from "./RecentFlowsContext";

const STORAGE_KEY = "planx:recentFlows";

let mockLocationKey = "key-1";

vi.mock("@tanstack/react-router", async () => {
  const actual = await vi.importActual("@tanstack/react-router");
  return { ...actual, useRouterState: vi.fn() };
});

const mockUseRouterState = vi.mocked(TanStackRouter.useRouterState);

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <RecentFlowsProvider>{children}</RecentFlowsProvider>
);

/**
 * Simulate the router moving to a new history entry
 */
const navigate = async (newKey: string, rerender: () => void) => {
  mockLocationKey = newKey;
  await act(async () => rerender());
};

beforeEach(() => {
  sessionStorage.clear();
  mockLocationKey = "key-1";
  mockUseRouterState.mockImplementation(() => mockLocationKey as any);
});

describe("initial state", () => {
  it("starts with an empty journey when sessionStorage is empty", () => {
    const { result } = renderHook(() => useRecentFlowsContext(), { wrapper });
    expect(result.current.recentFlows).toEqual([]);
  });

  it("restores journey for the current key from sessionStorage on mount", () => {
    const stored = { "key-1": [{ id: "flow-a", folderIds: [] }] };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stored));

    const { result } = renderHook(() => useRecentFlowsContext(), { wrapper });
    expect(result.current.recentFlows).toEqual([
      { id: "flow-a", folderIds: [] },
    ]);
  });

  it("starts empty when sessionStorage has entries for other keys only", () => {
    const stored = { "old-key": [{ id: "flow-a", folderIds: [] }] };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stored));

    const { result } = renderHook(() => useRecentFlowsContext(), { wrapper });
    expect(result.current.recentFlows).toEqual([]);
  });

  it("handles corrupted sessionStorage gracefully", () => {
    sessionStorage.setItem(STORAGE_KEY, "not-valid-json{{{");

    const { result } = renderHook(() => useRecentFlowsContext(), { wrapper });
    expect(result.current.recentFlows).toEqual([]);
  });
});

describe("clicking a portal - addRecentFlow()", () => {
  it("appends a flow to the journey after navigation", async () => {
    const { result, rerender } = renderHook(() => useRecentFlowsContext(), {
      wrapper,
    });

    act(() => result.current.addRecentFlow({ id: "flow-a", folderIds: [] }));
    await navigate("key-2", rerender);

    expect(result.current.recentFlows).toEqual([
      { id: "flow-a", folderIds: [] },
    ]);
  });

  it("chains multiple portal navigations into a growing journey", async () => {
    const { result, rerender } = renderHook(() => useRecentFlowsContext(), {
      wrapper,
    });

    act(() => result.current.addRecentFlow({ id: "flow-a", folderIds: [] }));
    await navigate("key-2", rerender);

    act(() =>
      result.current.addRecentFlow({ id: "flow-b", folderIds: ["f1"] }),
    );
    await navigate("key-3", rerender);

    expect(result.current.recentFlows).toEqual([
      { id: "flow-a", folderIds: [] },
      { id: "flow-b", folderIds: ["f1"] },
    ]);
  });

  it("persists the updated journey to sessionStorage", async () => {
    const { result, rerender } = renderHook(() => useRecentFlowsContext(), {
      wrapper,
    });

    act(() => result.current.addRecentFlow({ id: "flow-a", folderIds: [] }));
    await navigate("key-2", rerender);

    const stored = JSON.parse(sessionStorage.getItem(STORAGE_KEY)!);
    expect(stored["key-2"]).toEqual([{ id: "flow-a", folderIds: [] }]);
  });
});

describe("intra-flow navigation", () => {
  it("preserves the journey when navigating within the same flow", async () => {
    const { result, rerender } = renderHook(() => useRecentFlowsContext(), {
      wrapper,
    });

    // Enter portal flow
    act(() => result.current.addRecentFlow({ id: "flow-a", folderIds: [] }));
    await navigate("key-2", rerender);

    // Open a modal / change node type — no addRecentFlow call
    await navigate("key-modal", rerender);

    expect(result.current.recentFlows).toEqual([
      { id: "flow-a", folderIds: [] },
    ]);
  });

  it("preserves the journey across multiple intra-flow navigations", async () => {
    const { result, rerender } = renderHook(() => useRecentFlowsContext(), {
      wrapper,
    });

    act(() => result.current.addRecentFlow({ id: "flow-a", folderIds: [] }));
    await navigate("key-2", rerender);

    await navigate("key-modal-1", rerender);
    await navigate("key-modal-2", rerender);
    await navigate("key-modal-3", rerender);

    expect(result.current.recentFlows).toEqual([
      { id: "flow-a", folderIds: [] },
    ]);
  });
});

describe("browser back/forward", () => {
  it("restores an empty journey when going back to the root flow", async () => {
    const { result, rerender } = renderHook(() => useRecentFlowsContext(), {
      wrapper,
    });

    act(() => result.current.addRecentFlow({ id: "flow-a", folderIds: [] }));
    await navigate("key-2", rerender);
    expect(result.current.recentFlows).toHaveLength(1);

    // Browser back
    await navigate("key-1", rerender);
    expect(result.current.recentFlows).toEqual([]);
  });

  it("restores a partial journey when going back mid-chain", async () => {
    const { result, rerender } = renderHook(() => useRecentFlowsContext(), {
      wrapper,
    });

    act(() => result.current.addRecentFlow({ id: "flow-a", folderIds: [] }));
    await navigate("key-2", rerender);

    act(() => result.current.addRecentFlow({ id: "flow-b", folderIds: [] }));
    await navigate("key-3", rerender);
    expect(result.current.recentFlows).toHaveLength(2);

    // Browser back to flow-b (key-2)
    await navigate("key-2", rerender);
    expect(result.current.recentFlows).toEqual([
      { id: "flow-a", folderIds: [] },
    ]);
  });

  it("restores the full journey when going forward after going back", async () => {
    const { result, rerender } = renderHook(() => useRecentFlowsContext(), {
      wrapper,
    });

    act(() => result.current.addRecentFlow({ id: "flow-a", folderIds: [] }));
    await navigate("key-2", rerender);

    act(() => result.current.addRecentFlow({ id: "flow-b", folderIds: [] }));
    await navigate("key-3", rerender);

    // Browser back
    await navigate("key-2", rerender);
    expect(result.current.recentFlows).toHaveLength(1);

    // Browser forward
    await navigate("key-3", rerender);
    expect(result.current.recentFlows).toEqual([
      { id: "flow-a", folderIds: [] },
      { id: "flow-b", folderIds: [] },
    ]);
  });

  it("preserves the journey through intra-flow navigations when going back", async () => {
    const { result, rerender } = renderHook(() => useRecentFlowsContext(), {
      wrapper,
    });

    act(() => result.current.addRecentFlow({ id: "flow-a", folderIds: [] }));
    await navigate("key-2", rerender);
    // Intra-flow navigation
    await navigate("key-modal", rerender);

    // Browser back past the modal, then past the portal entry
    await navigate("key-2", rerender);
    expect(result.current.recentFlows).toHaveLength(1);

    await navigate("key-1", rerender);
    expect(result.current.recentFlows).toEqual([]);
  });
});

describe("clicking a breadcrumb - sliceRecentFlows()", () => {
  it("removes all flows from the target id onwards after navigation", async () => {
    const { result, rerender } = renderHook(() => useRecentFlowsContext(), {
      wrapper,
    });

    act(() => result.current.addRecentFlow({ id: "flow-a", folderIds: [] }));
    await navigate("key-2", rerender);
    act(() => result.current.addRecentFlow({ id: "flow-b", folderIds: [] }));
    await navigate("key-3", rerender);
    act(() => result.current.addRecentFlow({ id: "flow-c", folderIds: [] }));
    await navigate("key-4", rerender);

    // Click "back to flow-b" breadcrumb
    act(() => result.current.sliceRecentFlows("flow-b"));
    await navigate("key-5", rerender);

    expect(result.current.recentFlows).toEqual([
      { id: "flow-a", folderIds: [] },
    ]);
  });

  it("clears the journey entirely when navigating back to the root flow", async () => {
    const { result, rerender } = renderHook(() => useRecentFlowsContext(), {
      wrapper,
    });

    act(() => result.current.addRecentFlow({ id: "flow-a", folderIds: [] }));
    await navigate("key-2", rerender);

    act(() => result.current.sliceRecentFlows("flow-a"));
    await navigate("key-3", rerender);

    expect(result.current.recentFlows).toEqual([]);
  });

  it("browser back still works", async () => {
    const { result, rerender } = renderHook(() => useRecentFlowsContext(), {
      wrapper,
    });

    act(() => result.current.addRecentFlow({ id: "flow-a", folderIds: [] }));
    await navigate("key-2", rerender);
    act(() => result.current.addRecentFlow({ id: "flow-b", folderIds: [] }));
    await navigate("key-3", rerender);

    // Use breadcrumb to go back — the source key's journey must remain intact
    act(() => result.current.sliceRecentFlows("flow-a"));
    await navigate("key-4", rerender);
    expect(result.current.recentFlows).toEqual([]);

    // Browser back to flow-b (key-3) should still show full journey
    await navigate("key-3", rerender);
    expect(result.current.recentFlows).toEqual([
      { id: "flow-a", folderIds: [] },
      { id: "flow-b", folderIds: [] },
    ]);
  });

  it("falls back to an empty journey when the id is not found", async () => {
    const { result, rerender } = renderHook(() => useRecentFlowsContext(), {
      wrapper,
    });

    act(() => result.current.addRecentFlow({ id: "flow-a", folderIds: [] }));
    await navigate("key-2", rerender);

    act(() => result.current.sliceRecentFlows("unknown-id"));
    await navigate("key-3", rerender);

    expect(result.current.recentFlows).toEqual([]);
  });
});

describe("startNewRecentFlowsJourney", () => {
  it("clears the entire journey map from sessionStorage", () => {
    const stored = {
      "key-1": [],
      "key-2": [{ id: "flow-a", folderIds: [] }],
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    startNewRecentFlowsJourney();
    expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});
