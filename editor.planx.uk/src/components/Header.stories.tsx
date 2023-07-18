import { Meta, StoryObj } from "@storybook/react";
import React from "react";

import Header from "./Header";

const meta = {
  title: "Design System/Molecules/Header",
  component: Header,
} satisfies Meta<typeof Header>;

type Story = StoryObj<typeof meta>;

export default meta;

export const Basic = {
  render: () => <Header />,
} satisfies Story;
