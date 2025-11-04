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
    id: "1",
    data: {
      text: "Prior approval",
      img: "https://planx-temp.s3.eu-west-2.amazonaws.com/production/mdc5c7eb/Terrace_wraparound.svg",
      description: "This option has a description underneath.",
    },
    onChange: () => console.log("Radio changed"),
  },
} satisfies Story;
