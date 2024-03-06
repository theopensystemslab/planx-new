import { Meta, StoryObj } from "@storybook/react";
import React from "react";

import ApplicationsTable from "./ApplicationsTable";
import { mockApplications } from "./mocks";

const meta: Meta<typeof ApplicationsTable> = {
  title: "Design System/Molecules/ApplicationsTable",
  component: ApplicationsTable,
};

type Story = StoryObj<typeof meta>;

export default meta;

export const Basic: Story = {
  render: () => <ApplicationsTable applications={mockApplications} />,
};
