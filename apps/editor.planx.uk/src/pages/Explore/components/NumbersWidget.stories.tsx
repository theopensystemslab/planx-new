import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { DashboardWidget } from "ui/editor/DashboardWidget";

import { NumbersWidget } from "./NumbersWidget";

const meta = {
  title: "Editor Components/Explore/NumbersWidget",
  component: NumbersWidget,
  decorators: [
    (Story) => (
      <DashboardWidget title="Plan✕ in numbers" subtitle="last 30 days">
        <Story />
      </DashboardWidget>
    ),
  ],
  args: {
    stats: {
      lpasOnPlanX: 29,
      lpasOnPlanXPrevious: 27,
      onlineServices: 168,
      onlineServicesPrevious: 149,
      totalSessions: 12421,
      totalSessionsPrevious: 12052,
      totalSubmissions: 131,
      totalSubmissionsPrevious: 123,
    },
  },
} satisfies Meta<typeof NumbersWidget>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
  args: {
    stats: undefined,
  },
};
