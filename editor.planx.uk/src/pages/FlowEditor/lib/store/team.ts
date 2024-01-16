import {
  NotifyPersonalisation,
  Team,
  TeamSettings,
  TeamTheme,
} from "@opensystemslab/planx-core/types";
import gql from "graphql-tag";
import { client } from "lib/graphql";
import type { StateCreator } from "zustand";

import { SharedStore } from "./shared";

export interface TeamStore {
  teamId: number;
  teamTheme: TeamTheme;
  teamName: string;
  teamSettings?: TeamSettings;
  teamSlug: string;
  notifyPersonalisation?: NotifyPersonalisation;
  boundaryBBox?: Team["boundaryBBox"];

  setTeam: (team: Team) => void;
  getTeam: () => Team;
  initTeamStore: (slug: string) => Promise<void>;
  clearTeamStore: () => void;
  fetchCurrentTeam: () => Promise<Team>;
}

export const teamStore: StateCreator<
  TeamStore & SharedStore,
  [],
  [],
  TeamStore
> = (set, get) => ({
  teamId: 0,
  teamTheme: {} as TeamTheme,
  teamName: "",
  teamSettings: undefined,
  teamSlug: "",
  notifyPersonalisation: undefined,
  boundaryBBox: undefined,

  setTeam: (team) =>
    set({
      teamId: team.id,
      teamTheme: team.theme,
      teamName: team.name,
      teamSettings: team.settings,
      teamSlug: team.slug,
      notifyPersonalisation: team.notifyPersonalisation,
      boundaryBBox: team.boundaryBBox,
    }),

  getTeam: () => ({
    id: get().teamId,
    name: get().teamName,
    slug: get().teamSlug,
    settings: get().teamSettings,
    theme: get().teamTheme,
    notifyPersonalisation: get().notifyPersonalisation,
    boundaryBBox: get().boundaryBBox,
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
      teamId: 0,
      teamTheme: undefined,
      teamName: "",
      teamSettings: undefined,
      teamSlug: "",
      notifyPersonalisation: undefined,
      boundaryBBox: undefined,
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
});
