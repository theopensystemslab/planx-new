import { screen, waitFor } from "@testing-library/react";
import React from "react";
import { setup } from "testUtils";
import { beforeEach, describe, expect, it, vi } from "vitest";

import RecentFlows from "./RecentFlows";
import { RecentFlowsProvider } from "./RecentFlowsContext";

const STORAGE_KEY = "planx:recentFlows";

vi.mock("hooks/data/useExternalPortal", () => ({
  useExternalPortal: (id: string) => ({
    flow:
      {
        "flow-a": {
          id: "flow-a",
          slug: "apply-for-planning",
          name: "Apply for planning",
          team: { slug: "barnet" },
        },
        "flow-b": {
          id: "flow-b",
          slug: "check-if-permitted",
          name: "Check if permitted",
          team: { slug: "barnet" },
        },
        "flow-c": {
          id: "flow-c",
          slug: "find-out-if-you-need",
          name: "Find out if you need",
          team: { slug: "barnet" },
        },
      }[id] ?? null,
    loading: false,
    isCorrupted: false,
  }),
}));

const seedFlows = (flows: { id: string; folderIds: string[] }[]) =>
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(flows));

const withProvider = (children: React.ReactNode) => (
  <RecentFlowsProvider>{children}</RecentFlowsProvider>
);

beforeEach(() => sessionStorage.clear());

describe("RecentFlows", () => {
  it("renders nothing when there are no recent flows", async () => {
    const { container } = await setup(withProvider(<RecentFlows />));
    expect(container).toBeEmptyDOMElement();
  });

  describe("with a single flow", () => {
    beforeEach(() => seedFlows([{ id: "flow-a", folderIds: [] }]));

    it("renders a 'back to' breadcrumb for the flow", async () => {
      await setup(withProvider(<RecentFlows />));
      await waitFor(() =>
        expect(screen.getByText("back to")).toBeInTheDocument(),
      );
      expect(screen.getByText("apply-for-planning")).toBeInTheDocument();
    });

    it("does not render an expand button when there is only one flow", async () => {
      await setup(withProvider(<RecentFlows />));
      await waitFor(() =>
        expect(screen.getByText("apply-for-planning")).toBeInTheDocument(),
      );
      expect(
        screen.queryByRole("button", { name: /expand/i }),
      ).not.toBeInTheDocument();
    });
  });

  describe("with multiple flows", () => {
    beforeEach(() =>
      seedFlows([
        { id: "flow-a", folderIds: [] },
        { id: "flow-b", folderIds: [] },
        { id: "flow-c", folderIds: [] },
      ]),
    );

    it("shows only the most recent flow when collapsed", async () => {
      await setup(withProvider(<RecentFlows />));

      // Most recent is flow-c (last in array)
      await waitFor(() =>
        expect(screen.getByText("find-out-if-you-need")).toBeInTheDocument(),
      );
      expect(screen.queryByText("apply-for-planning")).not.toBeInTheDocument();
    });

    it("renders an expand button with the count of additional flows", async () => {
      await setup(withProvider(<RecentFlows />));
      await waitFor(() =>
        expect(
          screen.getByRole("button", {
            name: "Expand recent flows (2 more)",
          }),
        ).toBeInTheDocument(),
      );
    });

    it("shows all flows after expanding", async () => {
      const { user } = await setup(withProvider(<RecentFlows />));

      await waitFor(() =>
        expect(
          screen.getByRole("button", { name: /expand/i }),
        ).toBeInTheDocument(),
      );

      await user.click(screen.getByRole("button", { name: /expand/i }));

      await waitFor(() => {
        expect(screen.getByText("apply-for-planning")).toBeInTheDocument();
        expect(screen.getByText("check-if-permitted")).toBeInTheDocument();
        expect(screen.getByText("find-out-if-you-need")).toBeInTheDocument();
      });
    });

    it("collapses again after clicking the close button", async () => {
      const { user } = await setup(withProvider(<RecentFlows />));

      await waitFor(() =>
        expect(
          screen.getByRole("button", { name: /expand/i }),
        ).toBeInTheDocument(),
      );

      await user.click(screen.getByRole("button", { name: /expand/i }));

      await waitFor(() =>
        expect(
          screen.getByRole("button", { name: "Collapse recent flows" }),
        ).toBeInTheDocument(),
      );

      await user.click(
        screen.getByRole("button", { name: "Collapse recent flows" }),
      );

      await waitFor(() =>
        expect(
          screen.queryByText("apply-for-planning"),
        ).not.toBeInTheDocument(),
      );
    });
  });
});
