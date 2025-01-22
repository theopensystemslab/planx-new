import { Meta, StoryObj } from "@storybook/react";

import ImageRadio from "./ImageRadio";

const meta = {
  title: "Design System/Atoms/Form Elements/Radio/ImageRadio",
  component: ImageRadio,
} satisfies Meta<typeof ImageRadio>;

type Story = StoryObj<typeof meta>;

export default meta;

export const Basic = {
  args: {
    title: "Prior approval",
    img: "null",
    onChange: () => console.log("Radio changed"),
    description: "This option has a description underneath.",
    id: "1",
  },
} satisfies Story;
