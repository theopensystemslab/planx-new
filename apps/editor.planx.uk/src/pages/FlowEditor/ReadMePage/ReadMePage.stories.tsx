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
    teamSlug: "barnet",
    flowSlug: "Apply for prior permission",
    flowInformation: {
      status: "online",
      description: "A long description of a service",
      summary: "A short blurb",
      limitations: "",
      settings: {},
      isListedOnLPS: false,
    },
  },
} satisfies Story;
