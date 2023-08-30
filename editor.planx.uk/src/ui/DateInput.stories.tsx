import { Meta, StoryObj } from "@storybook/react";

import DateInput from "./DateInput";

const meta = {
  title: "Design System/Atoms/Form Elements/DateInput",
  component: DateInput,
  argTypes: {
    onChange: { action: true, control: { disable: true } },
  },
} satisfies Meta;

type Story = StoryObj<typeof meta>;

export default meta;

export const Basic = {
  args: {
    label: "When will the works start?",
    value: "2025-01-01",
    bordered: true,
    id: "date-input-0",
  },
} satisfies Story;

export const WithError = {
  args: {
    label: "",
    value: "2025-13-13",
    bordered: true,
    id: "date-input-0",
    error: "Enter a valid date",
  },
} satisfies Story;
