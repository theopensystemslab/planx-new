import { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { DashboardWidget } from "ui/editor/DashboardWidget";

import { ActivityWidget } from "./ActivityWidget";

const meta = {
  title: "Editor Components/Dashboard/ActivityWidget",
  component: ActivityWidget,
  decorators: [
    (Story) => (
      <DashboardWidget title="Activity">
        <Story />
      </DashboardWidget>
    ),
  ],
  args: {
    loading: false,
    sessions: [
      { name: "Apply for planning permission", count: 312 },
      { name: "Apply for a lawful development certificate", count: 198 },
      { name: "Report a planning breach", count: 134 },
      { name: "Prior approval: larger home extension", count: 79 },
      { name: "Apply for listed building consent", count: 22 },
    ],
    submissions: [
      { name: "Apply for planning permission", count: 204 },
      { name: "Apply for a lawful development certificate", count: 97 },
      { name: "Report a planning breach", count: 88 },
      { name: "Prior approval: larger home extension", count: 41 },
      { name: "Apply for listed building consent", count: 11 },
    ],
  },
} satisfies Meta<typeof ActivityWidget>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithData: Story = {};

export const NoData: Story = {
  args: {
    sessions: [],
    submissions: [],
  },
};

export const Loading: Story = {
  args: {
    loading: true,
  },
};
