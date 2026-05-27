import { Meta, StoryObj } from "@storybook/react";

import { StatsBanner } from "./StatsBanner";

const meta = {
  title: "Editor Components/Dashboard/StatsBanner",
  component: StatsBanner,
  args: {
    teamSlug: "test-council",
    loading: false,
    stats: {
      online_flows: 12,
      online_flows_previous: 10,
      sessions_current: 1840,
      sessions_previous: 1523,
      submissions_current: 304,
      submissions_previous: 318,
      guidance_sessions_current: 97,
      guidance_sessions_previous: 84,
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
