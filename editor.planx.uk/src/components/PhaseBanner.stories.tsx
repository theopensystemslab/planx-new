import { Meta, StoryObj } from "@storybook/react";
import React from "react";

import PhaseBanner from "./PhaseBanner";

const meta = {
  title: "Design System/Molecules/PhaseBanner",
  component: PhaseBanner,
} satisfies Meta<typeof PhaseBanner>;

type Story = StoryObj<typeof meta>;

export default meta;

export const Basic = {
  render: () => <PhaseBanner />,
} satisfies Story;
