import { Meta, StoryObj } from "@storybook/react";
import React from "react";

import { VerifyEmail } from "./VerifyEmail";

const meta = {
  title: "Design System/Pages/VerifyEmail",
  component: VerifyEmail,
} satisfies Meta<typeof VerifyEmail>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Basic = {
  render: () => <VerifyEmail params={{ sessionId: "1" }} />,
};
