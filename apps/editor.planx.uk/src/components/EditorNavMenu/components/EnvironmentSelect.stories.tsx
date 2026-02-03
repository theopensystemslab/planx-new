import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

import EnvironmentSelect from "./EnvironmentSelect";

const meta: Meta<typeof EnvironmentSelect> = {
  title: "Design System/Molecules/EnvironmentSelect",
  component: EnvironmentSelect,
};

export default meta;

type Story = StoryObj<typeof EnvironmentSelect>;

export const Basic = {
  render: () => <EnvironmentSelect />,
} satisfies Story;
