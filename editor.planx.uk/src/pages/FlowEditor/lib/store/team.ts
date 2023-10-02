import { GeoJSONObject } from "@turf/helpers";
import gql from "graphql-tag";
import { client } from "lib/graphql";
import { NotifyPersonalisation, TeamSettings } from "types";
import { TeamTheme } from "types";
import { Team } from "types";
import type { StateCreator } from "zustand";

export interface TeamStore {
  teamId: number;
  teamTheme?: TeamTheme;
  teamName: string;
  teamSettings?: TeamSettings;
  teamSlug: string;
  notifyPersonalisation?: NotifyPersonalisation;
  boundaryBBox?: GeoJSONObject;

  setTeam: (team: Team) => void;
  getTeam: () => Team;
  initTeamStore: (slug: string) => Promise<void>;
  clearTeamStore: () => void;
}

export const teamStore: StateCreator<TeamStore, [], [], TeamStore> = (
  set,
  get,
) => ({
  teamId: 0,
  teamTheme: undefined,
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
});
