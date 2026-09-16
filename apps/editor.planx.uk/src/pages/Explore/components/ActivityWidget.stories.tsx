import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { DashboardWidget } from "ui/editor/DashboardWidget";

import { ActivityWidget } from "./ActivityWidget";
import { ActivityEventType } from "./useActivityFeed";

const meta = {
  title: "Editor Components/Explore/ActivityWidget",
  component: ActivityWidget,
  decorators: [
    (Story) => (
      <Container maxWidth="contentWide">
        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: "repeat(auto-fit, minmax(470px, 1fr))",
          }}
        >
          <DashboardWidget title="Activity across Plan✕">
            <Story />
          </DashboardWidget>
        </Box>
      </Container>
    ),
  ],
  args: {
    events: [
      {
        id: "1",
        type: ActivityEventType.ServiceOnline,
        eventTime: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        teamName: "Lambeth",
        teamSlug: "lambeth",
        flowName: "Apply for planning permission",
        flowSlug: "apply-for-planning-permission",
      },
      {
        id: "2",
        type: ActivityEventType.ServiceOnline,
        eventTime: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
        teamName: "Doncaster",
        teamSlug: "doncaster",
        flowName: "Tree pre application advice",
        flowSlug: "tree-pre-application-advice",
      },
      {
        id: "3",
        type: ActivityEventType.TeamJoined,
        eventTime: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
        teamName: "Buckinghamshire",
        teamSlug: "buckinghamshire",
        flowName: null,
        flowSlug: null,
      },
      {
        id: "4",
        type: ActivityEventType.TeamJoined,
        eventTime: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
        teamName: "Barnet",
        teamSlug: "barnet",
        flowName: null,
        flowSlug: null,
      },
      {
        id: "5",
        type: ActivityEventType.ServiceOnline,
        eventTime: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
        teamName: "Southwark",
        teamSlug: "southwark",
        flowName: "Report a planning breach",
        flowSlug: "report-a-planning-breach",
      },
      {
        id: "6",
        type: ActivityEventType.ServiceOnline,
        eventTime: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
        teamName: "Camden",
        teamSlug: "camden",
        flowName: "Find out your planning application fee",
        flowSlug: "find-out-your-planning-application-fee",
      },
      {
        id: "7",
        type: ActivityEventType.TeamJoined,
        eventTime: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
        teamName: "Gateshead",
        teamSlug: "gateshead",
        flowName: null,
        flowSlug: null,
      },
      {
        id: "8",
        type: ActivityEventType.ServiceOnline,
        eventTime: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
        teamName: "Medway",
        teamSlug: "medway",
        flowName: "Get ecology advice",
        flowSlug: "get-ecology-advice",
      },
      {
        id: "9",
        type: ActivityEventType.TeamJoined,
        eventTime: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
        teamName: "Stockport",
        teamSlug: "stockport",
        flowName: null,
        flowSlug: null,
      },
      {
        id: "10",
        type: ActivityEventType.ServiceOnline,
        eventTime: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9).toISOString(),
        teamName: "Newcastle",
        teamSlug: "newcastle",
        flowName: "Apply for a lawful development certificate",
        flowSlug: "apply-for-a-lawful-development-certificate",
      },
    ],
  },
} satisfies Meta<typeof ActivityWidget>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
  args: {
    events: [],
  },
};

export const Loading: Story = {
  args: {
    loading: true,
    events: undefined,
  },
};
