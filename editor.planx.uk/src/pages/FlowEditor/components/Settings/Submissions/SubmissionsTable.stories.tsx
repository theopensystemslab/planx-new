import { Meta, StoryObj } from "@storybook/react";
import React from "react";

import { mockApplications } from "./mocks";
import SubmissionsTable from "./SubmissionsTable";

const meta: Meta<typeof SubmissionsTable> = {
  title: "Design System/Molecules/SubmissionsTable",
  component: SubmissionsTable,
};

type Story = StoryObj<typeof meta>;

export default meta;

export const Basic: Story = {
  render: () => <SubmissionsTable applications={mockApplications} />,
};
