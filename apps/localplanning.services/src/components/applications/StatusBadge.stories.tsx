import type { Meta, StoryObj } from "@storybook/react";
import { StatusBadge } from "./StatusBadge";

const meta = {
  title: "Atoms/StatusBadge",
  component: StatusBadge,
  parameters: { layout: "fullwidth" },
} satisfies Meta<typeof StatusBadge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Draft: Story = {
  args: {
    status: "draft",
    date: "1 March 2025",
  },
};

export const AwaitingPayment: Story = {
  args: {
    status: "awaitingPayment",
    date: "15 April 2025",
  },
};

export const Submitted: Story = {
  args: {
    status: "submitted",
    date: "20 January 2025",
  },
};
