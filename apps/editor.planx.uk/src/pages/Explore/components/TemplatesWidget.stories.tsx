import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { useStore } from "pages/FlowEditor/lib/store";
import { DashboardWidget } from "ui/editor/DashboardWidget";

import { TemplatesWidget } from "./TemplatesWidget";

const meta = {
  title: "Editor Components/Explore/TemplatesWidget",
  component: TemplatesWidget,
  decorators: [
    (Story) => {
      useStore.setState({
        teamSlug: "open-systems-lab",
        canUserEditTeam: (slug: string) => slug === "open-systems-lab",
      });

      return (
        <DashboardWidget title="Templates">
          <Story />
        </DashboardWidget>
      );
    },
  ],
  args: {
    templates: [
      {
        id: "1",
        name: "Apply for planning permission",
        summary: "This service submits an application for planning permission",
        team: { name: "Open Systems Lab" },
        subscribedTeams: [{ id: "team-1" }],
      },
      {
        id: "2",
        name: "Find out if you need planning permission",
        summary:
          "Use this service to find out if a project needs planning permission",
        team: { name: "Open Systems Lab" },
      },
      {
        id: "3",
        name: "Apply for works to trees",
        summary: "This service submits an application for works to trees",
        team: { name: "Open Systems Lab" },
      },
      {
        id: "4",
        name: "Apply for a lawful development certificate",
        summary:
          "This service submits an application for a lawful development certificate",
        team: { name: "Open Systems Lab" },
        subscribedTeams: [{ id: "team-1" }],
      },
    ],
  },
} satisfies Meta<typeof TemplatesWidget>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AllSubscribed: Story = {
  args: {
    templates: meta.args.templates?.map((template) => ({
      ...template,
      subscribedTeams: [{ id: "team-1" }],
    })),
  },
};

export const NoneSubscribed: Story = {
  args: {
    templates: meta.args.templates?.map((template) => ({
      ...template,
      subscribedTeams: [],
    })),
  },
};

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
