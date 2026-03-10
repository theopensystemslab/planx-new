import {
  Team,
  TeamIntegrations,
  TeamSettings,
  TeamTheme,
} from "@opensystemslab/planx-core/types";
import { TeamMember } from "pages/FlowEditor/components/Team/types";
import { CreateTeam } from "pages/Teams/AddTeamButton";
import { DEFAULT_PRIMARY_COLOR } from "theme";
import type { StateCreator } from "zustand";

import { SharedStore } from "./shared";

export type TeamSummary = Pick<Team, "id" | "name" | "slug"> & {
  settings: Pick<TeamSettings, "isTrial">;
} & { theme: Pick<TeamTheme, "primaryColour" | "logo"> };

export interface TeamStore {
  teamId: number;
  teams: TeamSummary[];
  teamIntegrations: TeamIntegrations;
  teamName: string;
  teamSettings: TeamSettings;
  teamSlug: string;
  teamTheme: TeamTheme;
  teamMembers: TeamMember[];
  teamDomain: string;

  setTeam: (team: Team) => void;
  setTeams: (teams: TeamSummary[]) => void;
  getTeam: () => Team;
  clearTeamStore: () => void;
  fetchCurrentTeam: () => Promise<Team>;
  createTeam: (newTeam: CreateTeam) => Promise<number>;
  setTeamMembers: (teamMembers: TeamMember[]) => Promise<void>;
  deleteUser: (userId: number) => Promise<boolean>;
}

export const teamStore: StateCreator<
  TeamStore & SharedStore,
  [],
  [],
  TeamStore
> = (set, get) => ({
  teamId: 0,
  teams: [],
  teamIntegrations: {} as TeamIntegrations,
  teamName: "",
  teamSettings: {} as TeamSettings,
  teamSlug: "",
  teamTheme: {
    primaryColour: DEFAULT_PRIMARY_COLOR,
    actionColour: DEFAULT_PRIMARY_COLOR,
    linkColour: DEFAULT_PRIMARY_COLOR,
    logo: null,
    favicon: null,
  },
  teamMembers: [] as TeamMember[],
  teamDomain: "",

  setTeams: (teams) => set({ teams }),

  setTeam: (team) => {
    set({
      teamId: team.id,
      teamIntegrations: team.integrations,
      teamName: team.name,
      teamSettings: team.settings,
      teamSlug: team.slug,
      teamTheme: team.theme,
      teamDomain: team.domain,
    });

    if (team.theme?.favicon) {
      const favicon = document.getElementById("favicon") as HTMLLinkElement;
      favicon.href = team.theme.favicon;
    }
  },

  getTeam: () => ({
    id: get().teamId,
    integrations: get().teamIntegrations,
    name: get().teamName,
    settings: get().teamSettings,
    slug: get().teamSlug,
    theme: get().teamTheme,
    members: get().teamMembers,
    domain: get().teamDomain,
  }),

  createTeam: async (newTeam) => {
    const { $client } = get();
    return await $client.team.create(newTeam);
  },

  clearTeamStore: () =>
    set({
      teamId: 0,
      teamIntegrations: undefined,
      teamName: "",
      teamSettings: undefined,
      teamSlug: "",
      teamTheme: undefined,
      teamMembers: [],
    }),

  /**
   * Fetch current team
   * Does not necessarily match team held in store as this is context-based (e.g. we don't use the team theme in the Editor)
   */
  fetchCurrentTeam: async () => {
    const { teamSlug, $client } = get();
    return await $client.team.getBySlug(teamSlug);
  },

  setTeamMembers: async (teamMembers: TeamMember[]) => {
    set(() => ({ teamMembers }));
  },
  deleteUser: async (userId: number) => {
    try {
      const { $client } = get();
      const response = await $client.user.delete(userId);
      return response;
    } catch (error) {
      throw new Error(`Unable to remove user. ${error}`);
    }
  },
});
