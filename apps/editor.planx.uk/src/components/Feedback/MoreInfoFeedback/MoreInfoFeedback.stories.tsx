import { Meta, StoryObj } from "@storybook/react-vite";

import MoreInfoFeedbackComponent from "./MoreInfoFeedback";

const meta: Meta<typeof MoreInfoFeedbackComponent> = {
  title: "Design System/Molecules/MoreInfoFeedbackComponent",
  component: MoreInfoFeedbackComponent,
};

type Story = StoryObj<typeof meta>;

export default meta;

export const Basic: Story = {
  render: () => <MoreInfoFeedbackComponent />,
};
