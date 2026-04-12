import Box from "@mui/material/Box";
import type { Meta, StoryObj } from "@storybook/react";
import type { ExternalPortal } from "hooks/data/useExternalPortal";
import { graphql, HttpResponse } from "msw";
import React from "react";

import RecentFlows from "./RecentFlows";

const recentFlows = [
  { id: "ghi789", folderIds: [] },
  { id: "def456", folderIds: [] },
  { id: "abc123", folderIds: [] },
];

const mockFlows: Record<string, ExternalPortal> = {
  abc123: {
    id: "abc123",
    slug: "property-types",
    name: "Property types",
    team: { slug: "opensystemslab" },
  },
  def456: {
    id: "def456",
    slug: "about-the-property",
    name: "About the property",
    team: { slug: "opensystemslab" },
  },
  ghi789: {
    id: "ghi789",
    slug: "apply-for-prior-approval",
    name: "Apply for prior approval",
    team: { slug: "barnet" },
  },
};

const meta: Meta<typeof RecentFlows> = {
  title: "Design System/Molecules/RecentFlows",
  component: RecentFlows,
  parameters: {
    msw: {
      handlers: [
        graphql.query("GetExternalPortal", ({ variables }) => {
          const requestedPortal = mockFlows[variables.id];
          return HttpResponse.json({
            data: {
              externalPortal: requestedPortal || null,
            },
          });
        }),
      ],
    },
  },
  decorators: [
    (Story) => {
      sessionStorage.removeItem("planx:recentFlows");
      return (
        <Box sx={{ minHeight: 100 }}>
          <Story />
        </Box>
      );
    },
  ],
};

export default meta;

type Story = StoryObj<typeof RecentFlows>;

export const Basic = {
  render: () => <RecentFlows />,
  parameters: {
    tanstackRouter: {
      location: {
        pathname: "/",
        state: { recentFlows },
      },
    },
  },
} satisfies Story;

export const SingleFlow = {
  render: () => <RecentFlows />,
  parameters: {
    tanstackRouter: {
      location: {
        pathname: "/",
        state: { recentFlows: [recentFlows[0]] },
      },
    },
  },
} satisfies Story;
