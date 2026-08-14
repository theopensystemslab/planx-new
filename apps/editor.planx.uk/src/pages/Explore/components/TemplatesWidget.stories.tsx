import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { DashboardWidget } from "ui/editor/DashboardWidget";

import { TemplatesWidget } from "./TemplatesWidget";

const meta = {
  title: "Editor Components/Explore/TemplatesWidget",
  component: TemplatesWidget,
  decorators: [
    (Story) => (
      <DashboardWidget title="Templates">
        <Story />
      </DashboardWidget>
    ),
  ],
  args: {
    templates: [
      {
        id: "1",
        name: "Apply for planning permission",
        slug: "apply-for-planning-permission",
        summary: "This service submits an application for planning permission",
        team: { slug: "planx" },
      },
      {
        id: "2",
        name: "Find out if you need planning permission",
        slug: "find-out-if-you-need-planning-permission",
        summary:
          "Use this service to find out if a project needs planning permission",
        team: { slug: "planx" },
      },
      {
        id: "3",
        name: "Apply for works to trees",
        slug: "apply-for-works-to-trees",
        summary: "This service submits an application for works to trees",
        team: { slug: "planx" },
      },
      {
        id: "4",
        name: "Apply for a lawful development certificate",
        slug: "apply-for-a-lawful-development-certificate",
        summary:
          "This service submits an application for a lawful development certificate",
        team: { slug: "planx" },
      },
    ],
  },
} satisfies Meta<typeof TemplatesWidget>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
  args: {
    templates: [],
  },
};

export const Loading: Story = {
  args: {
    loading: true,
    templates: undefined,
  },
};
