import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";

import { ApplicationFilters } from "./ApplicationFilters";

const meta = {
  title: "Molecules/ApplicationFilters",
  component: ApplicationFilters,
  parameters: { layout: "padded" },
  args: {
    onFilterChange: fn(),
  },
  decorators: [
    (Story) => (
      <div className="max-w-xs">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ApplicationFilters>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    statusCounts: { draft: 3, awaitingPayment: 1, submitted: 2 },
  },
};

export const EmptyCounts: Story = {
  args: {
    statusCounts: { draft: 0, awaitingPayment: 0, submitted: 0 },
  },
};

export const SingleStatus: Story = {
  name: "Single status only",
  args: {
    statusCounts: { draft: 0, awaitingPayment: 0, submitted: 5 },
  },
};
