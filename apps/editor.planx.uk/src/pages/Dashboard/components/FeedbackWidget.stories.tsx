import { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { DashboardWidget } from "ui/editor/DashboardWidget";

import { FeedbackWidget } from "./FeedbackWidget";

const mockFlows = [
  { flowName: "Apply for planning permission", count: 14 },
  { flowName: "Apply for a lawful development certificate", count: 7 },
  { flowName: "Report a planning breach", count: 3 },
  { flowName: "Prior approval: larger home extension", count: 1 },
];

const meta = {
  title: "Editor Components/Dashboard/FeedbackWidget",
  component: FeedbackWidget,
  decorators: [
    (Story) => (
      <DashboardWidget
        title="Feedback"
        linkTarget="/app/test-council/feedback"
        linkText="view all feedback"
      >
        <Story />
      </DashboardWidget>
    ),
  ],
  args: {
    flows: mockFlows,
    total: mockFlows.reduce((sum, { count }) => sum + count, 0),
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
