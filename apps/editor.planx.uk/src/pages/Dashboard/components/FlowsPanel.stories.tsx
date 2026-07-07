import type { Meta, StoryObj } from "@storybook/tanstack-react";
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import { subDays, subHours, subMinutes } from "date-fns";
import type { FlowSummary } from "pages/FlowEditor/lib/store/editor";
import React from "react";
import { DashboardWidget } from "ui/editor/DashboardWidget";

import { FlowsPanel } from "./FlowsPanel";

const mockFlows: FlowSummary[] = [
  {
    id: "1",
    name: "Apply for planning permission",
    slug: "apply-for-planning-permission",
    status: "online",
    updatedAt: subMinutes(new Date(), 30).toISOString(),
    summary: "",
    operations: [],
    publishedFlows: [],
    templatedFrom: null,
    isTemplate: false,
    isListedOnLPS: false,
    isService: true,
    pinnedFlows: [{ flowId: "1" }],
    template: { team: { name: "Test Council" } },
  },
  {
    id: "2",
    name: "Apply for a lawful development certificate",
    slug: "apply-for-ldc",
    status: "online",
    updatedAt: subHours(new Date(), 3).toISOString(),
    summary: "",
    operations: [],
    publishedFlows: [],
    templatedFrom: null,
    isTemplate: false,
    isListedOnLPS: false,
    isService: true,
    pinnedFlows: [],
    template: { team: { name: "Test Council" } },
  },
  {
    id: "3",
    name: "Prior approval: larger home extension",
    slug: "prior-approval-larger-home-extension",
    status: "offline",
    updatedAt: subDays(new Date(), 1).toISOString(),
    summary: "",
    operations: [],
    publishedFlows: [],
    templatedFrom: "some-template-id",
    isTemplate: false,
    isListedOnLPS: false,
    isService: false,
    pinnedFlows: [{ flowId: "3" }],
    template: { team: { name: "Test Council" } },
  },
  {
    id: "4",
    name: "Report a planning breach",
    slug: "report-a-planning-breach",
    status: "offline",
    updatedAt: subDays(new Date(), 2).toISOString(),
    summary: "",
    operations: [],
    publishedFlows: [],
    templatedFrom: null,
    isTemplate: false,
    isListedOnLPS: false,
    isService: false,
    pinnedFlows: [],
    template: { team: { name: "Test Council" } },
  },
];

const meta = {
  title: "Editor Components/Dashboard/FlowsPanel",
  component: FlowsPanel,
  decorators: [
    (Story) => {
      const rootRoute = createRootRoute({
        component: () => (
          <DashboardWidget
            title="Flows"
            link={{
              to: "/app/$team",
              params: { team: "test-council" },
              label: "view all flows",
            }}
          >
            <Story />
          </DashboardWidget>
        ),
      });
      const router = createRouter({
        routeTree: rootRoute,
        history: createMemoryHistory({ initialEntries: ["/"] }),
      });

      return <RouterProvider router={router} />;
    },
  ],
  args: {
    flows: mockFlows,
    teamSlug: "test-council",
    loading: false,
  },
} satisfies Meta<typeof FlowsPanel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithFlows: Story = {};

export const NoFlows: Story = {
  args: {
    flows: [],
  },
};

export const Loading: Story = {
  args: {
    loading: true,
  },
};
