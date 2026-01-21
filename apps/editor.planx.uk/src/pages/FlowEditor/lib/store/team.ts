import {
  Team,
  TeamIntegrations,
  TeamSettings,
  TeamTheme,
} from "@opensystemslab/planx-core/types";
import gql from "graphql-tag";
import { client } from "lib/graphql";
import { TeamMember } from "pages/FlowEditor/components/Team/types";
import { CreateTeam } from "pages/Teams/AddTeamButton";
import type { StateCreator } from "zustand";

import { SharedStore } from "./shared";

export interface TeamStore {
  teamId: number;
  teamIntegrations: TeamIntegrations;
  teamName: string;
  teamSettings: TeamSettings;
  teamSlug: string;
  teamTheme: TeamTheme;
  teamMembers: TeamMember[];
  teamDomain: string;

  setTeam: (team: Team) => void;
  getTeam: () => Team;
  initTeamStore: (slug: string) => Promise<void>;
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
  teamIntegrations: {} as TeamIntegrations,
  teamName: "",
  teamSettings: {} as TeamSettings,
  teamSlug: "",
  teamTheme: {} as TeamTheme,
  teamMembers: [] as TeamMember[],
  teamDomain: "",

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

  initTeamStore: async (slug) => {
    const { data } = await client.query({
      query: gql`
        query GetTeamBySlug($slug: String!) {
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
              primaryColour: primary_colour
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
            settings: team_settings {
              id
              boundaryUrl: boundary_url
              boundaryBBox: boundary_bbox
              referenceCode: reference_code
              helpEmail: help_email
              helpPhone: help_phone
              helpOpeningHours: help_opening_hours
              emailReplyToId: email_reply_to_id
              homepage: homepage
              externalPlanningSiteName: external_planning_site_name
              externalPlanningSiteUrl: external_planning_site_url
              submissionEmail: submission_email
              isTrial: is_trial
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
