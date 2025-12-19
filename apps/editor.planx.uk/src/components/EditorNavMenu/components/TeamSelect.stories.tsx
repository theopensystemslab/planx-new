import type { Meta, StoryObj } from "@storybook/react";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { TeamSummary } from "routes/authenticated";

import TeamSelect from "./TeamSelect";

const meta: Meta<typeof TeamSelect> = {
  title: "Design System/Molecules/TeamSelect",
  component: TeamSelect,
};

export default meta;

type Story = StoryObj<typeof TeamSelect>;

const mockTeams: TeamSummary[] = [
  {
    id: 1,
    slug: "open-systems-lab",
    name: "Open Systems Lab",
    theme: { primaryColour: "#0010A4" },
    settings: { isTrial: false },
  },
  {
    id: 2,
    slug: "lambeth",
    name: "Lambeth",
    theme: { primaryColour: "#006360" },
    settings: { isTrial: false },
  },
  {
    id: 3,
    slug: "doncaster",
    name: "Doncaster",
    theme: { primaryColour: "#981D6A" },
    settings: { isTrial: true },
  },
  {
    id: 4,
    slug: "camden",
    name: "Camden",
    theme: { primaryColour: "#000000" },
    settings: { isTrial: false },
  },
] as TeamSummary[];

export const Basic = {
  render: () => {
    useStore.setState({
      canUserEditTeam: (slug: string) => slug === "open-systems-lab",
    });

    return (
      <TeamSelect
        currentTeamSlug="open-systems-lab"
        onTeamSelect={(teamSlug) => console.log(`Navigating to ${teamSlug}`)}
        teams={mockTeams}
      />
    );
  },
} satisfies Story;
