import { Meta, StoryObj } from "@storybook/react";
import Radio from "ui/shared/Radio";

const meta = {
  title: "Design System/Atoms/Form Elements/Radio",
  component: Radio,
} satisfies Meta<typeof Radio>;

type Story = StoryObj<typeof Radio>;

export default meta;

export const Basic = {
  args: {
    value: "option-a",
    options: [
      {
        label: "Option A",
        value: "option-a",
      },
      {
        label: "Option B",
        value: "option-b",
      },
    ],
  },
} satisfies Story;
