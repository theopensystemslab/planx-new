import type { Meta, StoryObj } from "@storybook/tanstack-react";
import type { Notification } from "pages/FlowEditor/components/Notifications/types";

import { NotificationsWidget } from "./NotificationsWidget";

const mockNotifications: Notification[] = [
  {
    id: 1,
    flow: {
      name: "Apply for planning permission",
      slug: "apply-for-planning-permission",
    },
    team: { name: "Test Council", slug: "test-council" },
    type: "template_flow_updated",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    resolvedAt: null,
    resolvedByUser: null,
  },
  {
    id: 2,
    flow: {
      name: "Apply for a lawful development certificate",
      slug: "apply-for-ldc",
    },
    team: { name: "Test Council", slug: "test-council" },
    type: "template_flow_updated",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    resolvedAt: null,
    resolvedByUser: null,
  },
  {
    id: 3,
    flow: {
      name: "Prior approval: larger home extension",
      slug: "prior-approval-larger-home-extension",
    },
    team: { name: "Test Council", slug: "test-council" },
    type: "template_flow_updated",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    resolvedAt: null,
    resolvedByUser: null,
  },
];

const meta = {
  title: "Editor Components/Dashboard/NotificationsWidget",
  component: NotificationsWidget,
  args: {
    teamSlug: "test-council",
    notifications: mockNotifications,
    totalCount: mockNotifications.length,
  },
} satisfies Meta<typeof NotificationsWidget>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithNotifications: Story = {};

export const NoNotifications: Story = {
  args: {
    notifications: [],
    totalCount: 0,
  },
};

export const Loading: Story = {
  args: {
    loading: true,
    notifications: [],
    totalCount: 0,
  },
};
