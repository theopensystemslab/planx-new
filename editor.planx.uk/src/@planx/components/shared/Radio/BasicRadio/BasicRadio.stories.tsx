import { Meta, StoryObj } from "@storybook/react";

import BasicRadio from "./BasicRadio";

const meta = {
  title: "Design System/Atoms/Form Elements/Radio/BasicRadio",
  component: BasicRadio,
} satisfies Meta<typeof BasicRadio>;

type Story = StoryObj<typeof meta>;

export default meta;

export const Basic = {
  args: {
    title: "Prior approval",
    onChange: () => console.log("Radio changed"),
    id: "1",
  },
} satisfies Story;
