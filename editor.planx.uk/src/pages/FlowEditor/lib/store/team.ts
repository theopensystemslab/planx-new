import {
  Team,
  TeamIntegrations,
  TeamSettings,
  TeamTheme,
} from "@opensystemslab/planx-core/types";
import gql from "graphql-tag";
import { client } from "lib/graphql";
import type { StateCreator } from "zustand";

import { SharedStore } from "./shared";

export interface TeamStore {
  teamId: number;
  teamIntegrations: TeamIntegrations;
  teamName: string;
  teamDomain?: string;
  teamSettings: TeamSettings;
  teamSlug: string;
  teamTheme: TeamTheme;

  setTeam: (team: Team) => void;
  getTeam: () => Team;
  initTeamStore: (slug: string) => Promise<void>;
  clearTeamStore: () => void;
  fetchCurrentTeam: () => Promise<Team>;
  updateTeamTheme: (theme: Partial<TeamTheme>) => Promise<boolean>;
  updateTeamSettings: (teamSettings: Partial<TeamSettings>) => Promise<boolean>;
  createTeam: (newTeam: { name: string; slug: string }) => Promise<number>;
}

export const teamStore: StateCreator<
  TeamStore & SharedStore,
  [],
  [],
  TeamStore
> = (set, get) => ({
  teamId: 0,
  teamIntegrations: {} as TeamIntegrations,
  teamName: "",
  teamDomain: "",
  teamSettings: {} as TeamSettings,
  teamSlug: "",
  teamTheme: {} as TeamTheme,

  setTeam: (team) => {
    set({
      teamId: team.id,
      teamIntegrations: team.integrations,
      teamName: team.name,
      teamDomain: team.domain,
      teamSettings: team.settings,
      teamSlug: team.slug,
      teamTheme: team.theme,
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
    domain: get().teamDomain,
    settings: get().teamSettings,
    slug: get().teamSlug,
    theme: get().teamTheme,
  }),

  createTeam: async (newTeam) => {
    const { $client } = get();
    const isSuccess = await $client.team.create(newTeam);
    return isSuccess;
  },

  initTeamStore: async (slug) => {
    const { data } = await client.query({
      query: gql`
        query GetTeams($slug: String!) {
          teams(
            order_by: { name: asc }
            limit: 1
            where: { slug: { _eq: $slug } }
          ) {
            id
            name
            slug
            domain
            theme {
              primary_colour
              logo
            }
            flows(order_by: { updated_at: desc }) {
              slug
              updated_at
              operations(limit: 1, order_by: { id: desc }) {
                actor {
                  first_name
                  last_name
                }
              }
            }
            integrations {
              hasPlanningData: has_planning_data
            }
          }
        }
      `,
      variables: { slug },
    });

    const team = data.teams[0];

    if (!team) throw new Error("Team not found");
    get().setTeam(team);
  },

  clearTeamStore: () =>
    set({
      teamId: 0,
      teamIntegrations: undefined,
      teamName: "",
      teamSettings: undefined,
      teamSlug: "",
      teamTheme: undefined,
    }),

  /**
   * Fetch current team
   * Does not necessarily match team held in store as this is context-based (e.g. we don't use the team theme in the Editor)
   */
  fetchCurrentTeam: async () => {
    const { teamSlug, $client } = get();
    const team = await $client.team.getBySlug(teamSlug);
    return team;
  },

  updateTeamTheme: async (theme: Partial<TeamTheme>) => {
    const { teamId, $client } = get();
    const isSuccess = await $client.team.updateTheme(teamId, theme);
    return isSuccess;
  },

  updateTeamSettings: async (teamSettings: Partial<TeamSettings>) => {
    const { teamId, $client } = get();
    const isSuccess = await $client.team.updateTeamSettings(
      teamId,
      teamSettings,
    );
    return isSuccess;
  },
});
