import { Meta, StoryObj } from "@storybook/react";

import { defaultContent } from "../components/defaultContent";
import Public from "./Public";

const meta = {
  title: "PlanX Components/Feedback",
  component: Public,
} satisfies Meta<typeof Public>;

type Story = StoryObj<typeof meta>;

export default meta;

export const Basic = {
  args: defaultContent,
} satisfies Story;

export const WithFeedbackRequired = {
  args: { ...defaultContent, feedbackRequired: true },
} satisfies Story;
