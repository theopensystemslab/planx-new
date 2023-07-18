import { Meta, StoryObj } from "@storybook/react";

import Input from "./Input";

const meta = {
  title: "Design System/Atoms/Form Elements/Input",
  component: Input,
} satisfies Meta<typeof Input>;

type Story = StoryObj<typeof meta>;

export default meta;

export const Basic = {
  args: {
    bordered: true,
    multiline: false,
    rows: 1,
  },
} satisfies Story;

export const Multiline = {
  args: {
    bordered: true,
    multiline: true,
    rows: 3,
  },
} satisfies Story;

export const WithError = {
  args: {
    bordered: true,
    errorMessage: "Enter a value",
  },
} satisfies Story;
