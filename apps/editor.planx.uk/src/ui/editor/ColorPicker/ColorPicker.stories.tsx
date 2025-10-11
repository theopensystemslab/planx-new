import { Meta, StoryObj } from "@storybook/react";

import ColorPicker from "./ColorPicker";

const meta = {
  title: "Design System/Atoms/Form Elements/ColorPicker",
  component: ColorPicker,
} satisfies Meta<typeof ColorPicker>;

type Story = StoryObj<typeof meta>;

export default meta;

export const Basic = {
  args: {
    label: "Pick a color",
    inline: false,
    color: "#ffdd00",
  },
} satisfies Story;
