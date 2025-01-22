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
    img: "https://planx-temp.s3.eu-west-2.amazonaws.com/production/mdc5c7eb/Terrace_wraparound.svg",
    onChange: () => console.log("Radio changed"),
    description: "This option has a description underneath.",
    id: "1",
  },
} satisfies Story;
