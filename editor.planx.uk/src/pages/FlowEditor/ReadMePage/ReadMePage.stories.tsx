import { Meta, StoryObj } from "@storybook/react";

import { ReadMePage } from "./ReadMePage";

const meta = {
  title: "Design System/Pages/ReadMe",
  component: ReadMePage,
} satisfies Meta<typeof ReadMePage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Basic = {
  args: {
    flowSlug: "find-out-if-you-need-planning-permission",
    teamSlug: "barnet",
    flowInformation: {
      status: "online",
      description: "A long description of a service",
      summary: "A short blurb",
      limitations: "",
      settings: {},
    },
  },
} satisfies Story;
