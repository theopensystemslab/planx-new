import { Meta, StoryObj } from "@storybook/react";

import Public from "./Public";

const meta = {
  title: "PlanX Components/Feedback",
  component: Public,
} satisfies Meta<typeof Public>;

type Story = StoryObj<typeof meta>;

export default meta;

export const Basic = {
  args: {
    title: "Tell us what you think",
    description:
      "This service is a work in progress, any feedback you share about your experience will help us to improve it.",
  },
} satisfies Story;
