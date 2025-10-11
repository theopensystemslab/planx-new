import { Meta, StoryObj } from "@storybook/react";

import DelayedLoadingIndicator from "./DelayedLoadingIndicator";

const meta = {
  title: "Design System/Molecules/DelayedLoadingIndicator",
  component: DelayedLoadingIndicator,
} satisfies Meta<typeof DelayedLoadingIndicator>;

type Story = StoryObj<typeof meta>;

export default meta;

export const Spinner = {
  args: {
    msDelayBeforeVisible: 5,
    text: "Loading...",
  },
} satisfies Story;

export const TextOnly = {
  args: {
    msDelayBeforeVisible: 5,
    text: "Loading",
    variant: "ellipses",
  },
} satisfies Story;
