import { Meta, StoryObj } from "@storybook/react";
import React from "react";

import { mockApplications } from "./mocks";
import SubmissionsView from "./SubmissionsView";

const meta: Meta<typeof SubmissionsView> = {
  title: "Design System/Molecules/SubmissionsView",
  component: SubmissionsView,
};

type Story = StoryObj<typeof meta>;

export default meta;

export const DefaultView: Story = {
  render: () => (
    <SubmissionsView
      applications={mockApplications}
      loading={false}
      error={undefined}
    />
  ),
};

export const Loading: Story = {
  render: () => (
    <SubmissionsView applications={[]} loading={true} error={undefined} />
  ),
};

export const ErrorState: Story = {
  render: () => (
    <SubmissionsView
      applications={[]}
      loading={false}
      error={new Error("Failed to load data")}
    />
  ),
};

export const Empty: Story = {
  render: () => (
    <SubmissionsView applications={[]} loading={false} error={undefined} />
  ),
};
