import { Meta, StoryObj } from "@storybook/tanstack-react";
import React from "react";
import { DashboardWidget } from "ui/editor/DashboardWidget";

import { FeedbackWidget } from "./FeedbackWidget";

const mockFlows = [
  {
    flowName: "Apply for planning permission",
    flowSlug: "apply-for-planning-permission",
    count: 14,
  },
  {
    flowName: "Apply for a lawful development certificate",
    flowSlug: "apply-for-a-lawful-development-certificate",
    count: 7,
  },
  {
    flowName: "Report a planning breach",
    flowSlug: "report-a-planning-breach",
    count: 3,
  },
  {
    flowName: "Prior approval: larger home extension",
    flowSlug: "prior-approval-larger-home-extension",
    count: 1,
  },
];

const meta = {
  title: "Editor Components/Dashboard/FeedbackWidget",
  component: FeedbackWidget,
  decorators: [
    (Story) => (
      <DashboardWidget
        title="Feedback"
        link={{
          to: "/app/$team/feedback",
          params: { team: "test-council" },
          label: "view all feedback",
        }}
      >
        <Story />
      </DashboardWidget>
    ),
  ],
  args: {
    flows: mockFlows,
    total: mockFlows.reduce((sum, { count }) => sum + count, 0),
    teamSlug: "test-council",
    loading: false,
  },
} satisfies Meta<typeof FeedbackWidget>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithFeedback: Story = {};

export const NoFeedback: Story = {
  args: {
    flows: [],
    total: 0,
  },
};

export const Loading: Story = {
  args: {
    loading: true,
  },
};
