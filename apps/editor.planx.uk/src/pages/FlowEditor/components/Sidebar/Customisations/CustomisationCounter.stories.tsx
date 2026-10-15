import type { Meta, StoryObj } from "@storybook/tanstack-react";

import { CustomisationCounter } from "./CustomisationCounter";

const meta = {
  title: "Editor Components/Templates/CustomisationCounter",
  component: CustomisationCounter,
  args: {
    required: 4,
    completed: 0,
  },
} satisfies Meta<typeof CustomisationCounter>;

export default meta;

type Story = StoryObj<typeof meta>;

export const NoneComplete: Story = {
  name: "0/4 customisations complete",
  args: { completed: 0 },
};

export const SomeComplete: Story = {
  name: "2/4 customisations complete",
  args: { completed: 2 },
};

export const AllComplete: Story = {
  name: "All customisations complete",
  args: { completed: 4 },
};
