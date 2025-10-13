import { Meta, StoryObj } from "@storybook/react";
import React from "react";

import Feedback from "./index";

const meta: Meta<typeof Feedback> = {
  title: "Design System/Molecules/Feedback",
  component: Feedback,
};

type Story = StoryObj<typeof meta>;

export default meta;

export const Basic: Story = {
  render: () => <Feedback />,
};
