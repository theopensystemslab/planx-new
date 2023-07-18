import { Meta, StoryObj } from "@storybook/react";

import ErrorFallback from "./ErrorFallback";

const meta = {
  title: "Design System/Molecules/ErrorFallback",
  component: ErrorFallback,
} satisfies Meta<typeof ErrorFallback>;

type Story = StoryObj<typeof meta>;

export default meta;

export const Basic = {
  args: {
    error: {
      name: "Storybook test",
      message: "Failed to fetch data",
    },
  },
} satisfies Story;
