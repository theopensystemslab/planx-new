import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

import TeamSelect from "./TeamSelect";

const meta: Meta<typeof TeamSelect> = {
  title: "Design System/Molecules/TeamSelect",
  component: TeamSelect,
};

export default meta;

type Story = StoryObj<typeof TeamSelect>;

export const Basic = {
  render: () => <TeamSelect />,
} satisfies Story;
