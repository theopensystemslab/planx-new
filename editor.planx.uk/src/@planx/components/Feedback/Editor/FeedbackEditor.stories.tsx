import { Meta, StoryObj } from "@storybook/react";
import React from "react";

import { FeedbackEditor } from "./Editor";
const meta = {
  title: "Editor Components/Feedback modal",
  component: FeedbackEditor,
} satisfies Meta<typeof FeedbackEditor>;
type Story = StoryObj<typeof meta>;
export default meta;
export const Basic = {
  render: () => <FeedbackEditor />,
} satisfies Story;
