import {
  NotifyPersonalisation,
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
  boundaryBBox?: Team["boundaryBBox"];
  notifyPersonalisation?: NotifyPersonalisation;
  teamId: number;
  teamIntegrations: TeamIntegrations;
  teamName: string;
  teamSettings?: TeamSettings;
  teamSlug: string;
  teamTheme: TeamTheme;

  setTeam: (team: Team) => void;
  getTeam: () => Team;
  initTeamStore: (slug: string) => Promise<void>;
  clearTeamStore: () => void;
  fetchCurrentTeam: () => Promise<Team>;
  updateTeamTheme: (theme: Partial<TeamTheme>) => Promise<boolean>;
}

export const teamStore: StateCreator<
  TeamStore & SharedStore,
  [],
  [],
  TeamStore
> = (set, get) => ({
  boundaryBBox: undefined,
  notifyPersonalisation: undefined,
  teamId: 0,
  teamIntegrations: {} as TeamIntegrations,
  teamName: "",
  teamSettings: undefined,
  teamSlug: "",
  teamTheme: {} as TeamTheme,

  setTeam: (team) => {
    set({
      boundaryBBox: team.boundaryBBox,
      notifyPersonalisation: team.notifyPersonalisation,
      teamId: team.id,
      teamIntegrations: team.integrations,
      teamName: team.name,
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
    boundaryBBox: get().boundaryBBox,
    id: get().teamId,
    integrations: get().teamIntegrations,
    name: get().teamName,
    notifyPersonalisation: get().notifyPersonalisation,
    settings: get().teamSettings,
    slug: get().teamSlug,
    theme: get().teamTheme,
  }),

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
      boundaryBBox: undefined,
      notifyPersonalisation: undefined,
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
});
