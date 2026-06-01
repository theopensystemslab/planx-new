import { Meta, StoryObj } from "@storybook/tanstack-react";

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
