import { Meta, StoryObj } from "@storybook/react";

import ErrorSummary from "../shared/ErrorSummary";

const meta = {
  title: "Design System/Molecules/ErrorSummary",
  component: ErrorSummary,
} satisfies Meta<typeof ErrorSummary>;

type Story = StoryObj<typeof meta>;

export default meta;

export const Error = {
  args: {
    heading: "Application error",
    message: "Summary of error message.",
    format: "error",
  },
} satisfies Story;

export const Warning = {
  args: {
    heading: "Application warning",
    message: "Summary of warning message.",
    format: "warning",
  },
} satisfies Story;

export const Info = {
  args: {
    heading: "Application info",
    message: "Summary of information message.",
    format: "info",
  },
} satisfies Story;
