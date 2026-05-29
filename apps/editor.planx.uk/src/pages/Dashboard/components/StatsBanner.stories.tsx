import { Meta, StoryObj } from "@storybook/react";

import { StatsBanner } from "./StatsBanner";

const meta = {
  title: "Editor Components/Dashboard/StatsBanner",
  component: StatsBanner,
  args: {
    teamSlug: "test-council",
    loading: false,
    stats: {
      onlineFlows: 12,
      onlineFlowsPrevious: 10,
      sessionsCurrent: 1840,
      sessionsPrevious: 1523,
      submissionsCurrent: 304,
      submissionsPrevious: 318,
      guidanceSessionsCurrent: 97,
      guidanceSessionsPrevious: 84,
    },
  },
} satisfies Meta<typeof StatsBanner>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithStats: Story = {};

export const NoStats: Story = {
  args: {
    stats: undefined,
  },
};

export const Loading: Story = {
  args: {
    loading: true,
    stats: undefined,
  },
};
