import { Meta, StoryObj } from "@storybook/react";
import InputField from "ui/InputField";

const meta = {
  title: "Design System/Atoms/Form Elements/InputField",
  component: InputField,
} satisfies Meta<typeof InputField>;

type Story = StoryObj<typeof InputField>;

export default meta;

export const Basic = {
  args: {
    name: "name",
    placeholder: "Enter your name",
    multiline: false,
    rows: 1,
    disabled: false,
    required: false,
  },
} satisfies Story;
