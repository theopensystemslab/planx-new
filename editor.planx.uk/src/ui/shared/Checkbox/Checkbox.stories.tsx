import { Meta, StoryObj } from "@storybook/react";

import Checkbox from "./Checkbox";

const meta = {
  title: "Design System/Atoms/Form Elements/Checkbox",
  component: Checkbox,
} satisfies Meta<typeof Checkbox>;

type Story = StoryObj<typeof meta>;

export default meta;

export const Basic = {
  args: {
    id: "storybook-test-0",
    checked: false,
  },
} satisfies Story;
