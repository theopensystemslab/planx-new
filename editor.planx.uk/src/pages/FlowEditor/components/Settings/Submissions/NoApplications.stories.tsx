import { Meta, StoryObj } from "@storybook/react";
import React from "react";

import NoApplications from "./NoApplications";

const meta: Meta<typeof NoApplications> = {
  title: "Design System/Molecules/NoApplications",
  component: NoApplications,
};

type Story = StoryObj<typeof meta>;

export default meta;

export const Basic: Story = {
  render: () => <NoApplications />,
};
