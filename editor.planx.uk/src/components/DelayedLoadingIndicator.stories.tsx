import { Meta, StoryObj } from "@storybook/react";

import DelayedLoadingIndicator from "./DelayedLoadingIndicator";

const meta = {
  title: "Design System/Molecules/DelayedLoadingIndicator",
  component: DelayedLoadingIndicator,
} satisfies Meta<typeof DelayedLoadingIndicator>;

type Story = StoryObj<typeof meta>;

export default meta;

export const Basic = {
  args: {
    msDelayBeforeVisible: 5,
    text: "Loading...",
  },
} satisfies Story;
