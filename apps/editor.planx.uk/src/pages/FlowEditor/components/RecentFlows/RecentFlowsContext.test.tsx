import { act, renderHook } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it } from "vitest";

import {
  clearRecentFlowsStorage,
  RecentFlowsProvider,
  useRecentFlowsContext,
} from "./RecentFlowsContext";

const STORAGE_KEY = "planx:recentFlows";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <RecentFlowsProvider>{children}</RecentFlowsProvider>
);

beforeEach(() => sessionStorage.clear());

describe("RecentFlowsProvider", () => {
  it("initialises with an empty list when sessionStorage is empty", () => {
    const { result } = renderHook(() => useRecentFlowsContext(), { wrapper });
    expect(result.current.recentFlows).toEqual([]);
  });

  it("initialises from sessionStorage on mount", () => {
    const stored = [{ id: "abc", folderIds: [] }];
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stored));

    const { result } = renderHook(() => useRecentFlowsContext(), { wrapper });
    expect(result.current.recentFlows).toEqual(stored);
  });

  it("handles corrupted sessionStorage gracefully", () => {
    sessionStorage.setItem(STORAGE_KEY, "not-valid-json{{{");

    const { result } = renderHook(() => useRecentFlowsContext(), { wrapper });
    expect(result.current.recentFlows).toEqual([]);
  });
});

describe("addRecentFlow", () => {
  it("appends a flow to the list", () => {
    const { result } = renderHook(() => useRecentFlowsContext(), { wrapper });

    act(() => result.current.addRecentFlow({ id: "flow1", folderIds: [] }));
    act(() => result.current.addRecentFlow({ id: "flow2", folderIds: ["f1"] }));

    expect(result.current.recentFlows).toEqual([
      { id: "flow1", folderIds: [] },
      { id: "flow2", folderIds: ["f1"] },
    ]);
  });

  it("writes the updated list to sessionStorage synchronously", () => {
    const { result } = renderHook(() => useRecentFlowsContext(), { wrapper });

    act(() => result.current.addRecentFlow({ id: "flow1", folderIds: [] }));

    const stored = JSON.parse(sessionStorage.getItem(STORAGE_KEY)!);
    expect(stored).toEqual([{ id: "flow1", folderIds: [] }]);
  });
});

describe("sliceRecentFlows", () => {
  it("removes all flows from the target id onwards", () => {
    const initial = [
      { id: "flow1", folderIds: [] },
      { id: "flow2", folderIds: [] },
      { id: "flow3", folderIds: [] },
    ];
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(initial));

    const { result } = renderHook(() => useRecentFlowsContext(), { wrapper });

    act(() => result.current.sliceRecentFlows("flow2"));

    expect(result.current.recentFlows).toEqual([
      { id: "flow1", folderIds: [] },
    ]);
  });

  it("leaves the list unchanged when the target id is not found", () => {
    const initial = [{ id: "flow1", folderIds: [] }];
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(initial));

    const { result } = renderHook(() => useRecentFlowsContext(), { wrapper });

    act(() => result.current.sliceRecentFlows("unknown-id"));

    expect(result.current.recentFlows).toEqual(initial);
  });

  it("writes the sliced list to sessionStorage synchronously", () => {
    const initial = [
      { id: "flow1", folderIds: [] },
      { id: "flow2", folderIds: [] },
    ];
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(initial));

    const { result } = renderHook(() => useRecentFlowsContext(), { wrapper });

    act(() => result.current.sliceRecentFlows("flow2"));

    const stored = JSON.parse(sessionStorage.getItem(STORAGE_KEY)!);
    expect(stored).toEqual([{ id: "flow1", folderIds: [] }]);
  });
});

describe("clearRecentFlowsStorage", () => {
  it("removes the key from sessionStorage", () => {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([{ id: "flow1", folderIds: [] }]),
    );
    clearRecentFlowsStorage();
    expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});
