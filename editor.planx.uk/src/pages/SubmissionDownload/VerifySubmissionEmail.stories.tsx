import { Meta, StoryObj } from "@storybook/react";
import React from "react";

import { VerifySubmissionEmail } from "./VerifySubmissionEmail";

const meta = {
  title: "Design System/Pages/VerifySubmissionEmail",
  component: VerifySubmissionEmail,
} satisfies Meta<typeof VerifySubmissionEmail>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Basic = {
  render: () => (
    <VerifySubmissionEmail params={{ sessionId: "1", team: "PlanX" }} />
  ),
};
