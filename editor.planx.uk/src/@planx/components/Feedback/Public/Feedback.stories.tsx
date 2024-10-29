import { Meta, StoryObj } from "@storybook/react";

import Public from "./Public";

const meta = {
  title: "PlanX Components/Feedback",
  component: Public,
} satisfies Meta<typeof Public>;

type Story = StoryObj<typeof meta>;

export default meta;

export const Basic = {
  args: {
    title: "Tell us what you think",
    privacyPolicyLink: "https://www.planx.uk/",
  },
} satisfies Story;
