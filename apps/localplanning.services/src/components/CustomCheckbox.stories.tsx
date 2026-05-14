import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { CustomCheckbox } from "./CustomCheckbox";

const meta = {
  title: "Atoms/CustomCheckbox",
  component: CustomCheckbox,
  parameters: { layout: "padded" },
  args: {
    onChange: fn(),
  },
} satisfies Meta<typeof CustomCheckbox>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Checked: Story = {
  args: {
    id: "checkbox-checked",
    checked: true,
    label: "Draft applications",
    count: 3,
  },
};

export const Unchecked: Story = {
  args: {
    id: "checkbox-unchecked",
    checked: false,
    label: "Awaiting payment",
    count: 1,
  },
};

export const NoCount: Story = {
  args: {
    id: "checkbox-no-count",
    checked: true,
    label: "Submitted applications",
  },
};

export const Disabled: Story = {
  args: {
    id: "checkbox-disabled",
    checked: false,
    label: "Disabled option",
    count: 0,
    disabled: true,
  },
};
