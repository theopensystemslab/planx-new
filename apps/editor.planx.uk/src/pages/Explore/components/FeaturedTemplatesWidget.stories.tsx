import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { DashboardWidget } from "ui/editor/DashboardWidget";

import { FeaturedTemplatesWidget } from "./FeaturedTemplatesWidget";

const meta = {
  title: "Editor Components/Explore/FeaturedTemplatesWidget",
  component: FeaturedTemplatesWidget,
  decorators: [
    (Story) => (
      <DashboardWidget title="Featured templates">
        <Story />
      </DashboardWidget>
    ),
  ],
  args: {
    templates: [
      {
        id: "1",
        name: "Apply for planning permission",
        summary: "This service submits an application for planning permission",
      },
      {
        id: "2",
        name: "Find out if you need planning permission",
        summary:
          "Use this service to find out if a project needs planning permission",
      },
      {
        id: "3",
        name: "Apply for works to trees",
        summary: "This service submits an application for works to trees",
      },
      {
        id: "4",
        name: "Apply for a lawful development certificate",
        summary:
          "This service submits an application for a lawful development certificate",
      },
    ],
  },
} satisfies Meta<typeof FeaturedTemplatesWidget>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
  args: {
    templates: [],
  },
};
