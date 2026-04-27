import { screen, waitFor } from "@testing-library/react";
import React from "react";
import { setup } from "testUtils";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { RecentFlowLink } from "./RecentFlowLink";
import { RecentFlowsContext } from "./RecentFlowsContext";

const mockFlows: Record<
  string,
  { id: string; slug: string; name: string; team: { slug: string } }
> = {
  "flow-abc": {
    id: "flow-abc",
    slug: "a-flow-with-a-really-long-slug-here",
    name: "Test flow",
    team: { slug: "myteam" },
  },
  "flow-short": {
    id: "flow-short",
    slug: "short",
    name: "Short flow",
    team: { slug: "myteam" },
  },
};

vi.mock("hooks/data/useExternalPortal", () => ({
  useExternalPortal: (id: string) => ({
    flow: mockFlows[id] ?? null,
    loading: false,
    isCorrupted: false,
  }),
}));

const mockSliceRecentFlows = vi.fn();

const contextValue = {
  recentFlows: [],
  addRecentFlow: vi.fn(),
  sliceRecentFlows: mockSliceRecentFlows,
};

const withContext = (children: React.ReactNode) => (
  <RecentFlowsContext.Provider value={contextValue}>
    {children}
  </RecentFlowsContext.Provider>
);

beforeEach(() => vi.clearAllMocks());

describe("RecentFlowLink", () => {
  it("renders null when the flow cannot be found", async () => {
    await setup(
      withContext(
        <RecentFlowLink flow={{ id: "unknown-id", folderIds: [] }} />,
      ),
    );
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("renders 'back to' label when isFirst=true", async () => {
    await setup(
      withContext(
        <RecentFlowLink flow={{ id: "flow-short", folderIds: [] }} isFirst />,
      ),
    );
    expect(screen.getByText("back to")).toBeInTheDocument();
    expect(screen.getByText("short")).toBeInTheDocument();
  });

  it("renders an arrow icon (not 'back to') when isFirst=false", async () => {
    await setup(
      withContext(
        <RecentFlowLink flow={{ id: "flow-short", folderIds: [] }} />,
      ),
    );
    expect(screen.queryByText("back to")).not.toBeInTheDocument();
    expect(document.querySelector("svg")).toBeInTheDocument();
  });

  it("truncates slugs longer than 20 characters with an ellipsis", async () => {
    await setup(
      withContext(
        <RecentFlowLink flow={{ id: "flow-abc", folderIds: [] }} isFirst />,
      ),
    );
    expect(screen.getByText("a-flow-with-a-really…")).toBeInTheDocument();
    expect(
      screen.queryByText("a-flow-with-a-really-long-slug-here"),
    ).not.toBeInTheDocument();
  });

  it("adds a title attribute when slug exceeds 20 characters", async () => {
    await setup(
      withContext(
        <RecentFlowLink flow={{ id: "flow-abc", folderIds: [] }} isFirst />,
      ),
    );
    const flowName = screen.getByText("a-flow-with-a-really…");
    expect(flowName).toHaveAttribute(
      "title",
      "a-flow-with-a-really-long-slug-here",
    );
  });

  it("does not add a title attribute when slug is 20 characters or fewer", async () => {
    await setup(
      withContext(
        <RecentFlowLink flow={{ id: "flow-short", folderIds: [] }} isFirst />,
      ),
    );
    const flowName = screen.getByText("short");
    expect(flowName).not.toHaveAttribute("title");
  });

  it("calls sliceRecentFlows with the flow id when clicked", async () => {
    const { user } = await setup(
      withContext(
        <RecentFlowLink flow={{ id: "flow-short", folderIds: [] }} isFirst />,
      ),
    );

    await user.click(screen.getByText("short").closest("a")!);

    await waitFor(() => {
      expect(mockSliceRecentFlows).toHaveBeenCalledTimes(1);
      expect(mockSliceRecentFlows).toHaveBeenCalledWith("flow-short");
    });
  });

  it("navigates to the correct route including folder slug", async () => {
    await setup(
      withContext(
        <RecentFlowLink
          flow={{ id: "flow-short", folderIds: ["folder1"] }}
          isFirst
        />,
      ),
    );
    const link = screen.getByText("short").closest("a")!;
    // TanStack Router URL-encodes commas in route params
    expect(link).toHaveAttribute(
      "href",
      expect.stringContaining("short%2Cfolder1"),
    );
  });
});
