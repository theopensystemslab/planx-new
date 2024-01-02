import { Meta, StoryObj } from "@storybook/react";
import OptionButton from "ui/editor/OptionButton";

const meta = {
  title: "Design System/Atoms/Form Elements/OptionButton",
  component: OptionButton,
} satisfies Meta<typeof OptionButton>;

type Story = StoryObj<typeof OptionButton>;

export default meta;

export const Basic = {
  args: {
    selected: false,
    backgroundColor: "#F9F8F8",
  },
} satisfies Story;
