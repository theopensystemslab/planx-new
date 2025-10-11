import { Meta, StoryObj } from "@storybook/react";

import DescriptionRadio from "./DescriptionRadio";

const meta = {
  title: "Design System/Atoms/Form Elements/Radio/DescriptionRadio",
  component: DescriptionRadio,
} satisfies Meta<typeof DescriptionRadio>;

type Story = StoryObj<typeof meta>;

export default meta;

export const Basic = {
  args: {
    title: "Prior approval",
    description: "This option has a description underneath.",
    onChange: () => console.log("Radio changed"),
    id: "1",
  },
} satisfies Story;
