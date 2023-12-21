import { Meta, StoryObj } from "@storybook/react";

import ChecklistItem from "./ChecklistItem";

const meta = {
  title: "Design System/Atoms/Form Elements/ChecklistItem",
  component: ChecklistItem,
} satisfies Meta<typeof ChecklistItem>;

type Story = StoryObj<typeof meta>;

export default meta;

export const Basic = {
  args: {
    id: "option-a",
    label: "Option A",
    checked: false,
  },
} satisfies Story;
