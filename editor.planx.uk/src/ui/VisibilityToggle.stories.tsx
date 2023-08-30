import { Meta, StoryObj } from "@storybook/react";
import VisibilityToggle from "ui/VisibilityToggle";

const meta = {
  title: "Design System/Atoms/Form Elements/VisibilityToggle",
  component: VisibilityToggle,
} satisfies Meta<typeof VisibilityToggle>;

type Story = StoryObj<typeof VisibilityToggle>;

export default meta;

export const Basic = {
  args: {
    visible: true,
  },
} satisfies Story;
