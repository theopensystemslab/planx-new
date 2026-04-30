import {
  Team,
  TeamIntegrations,
  TeamSettings,
  TeamTheme,
} from "@opensystemslab/planx-core/types";
import { DEFAULT_PRIMARY_COLOR } from "theme";
import type { StateCreator } from "zustand";

import { SharedStore } from "./shared";

export type TeamSummary = Pick<Team, "id" | "name" | "slug"> & {
  settings: Pick<TeamSettings, "isTrial">;
} & { theme: Pick<TeamTheme, "primaryColour" | "logo"> };

export interface TeamStore {
  teamId: number;
  teamIntegrations: TeamIntegrations;
  teamName: string;
  teamSettings: TeamSettings;
  teamSlug: string;
  teamTheme: TeamTheme;
  teamDomain: string;

  setTeam: (team: Team) => void;
  getTeam: () => Team;
  clearTeamStore: () => void;
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
  teamTheme: {
    primaryColour: DEFAULT_PRIMARY_COLOR,
    actionColour: DEFAULT_PRIMARY_COLOR,
    linkColour: DEFAULT_PRIMARY_COLOR,
    logo: null,
    favicon: null,
  },
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
    domain: get().teamDomain,
  }),

  clearTeamStore: () =>
    set({
      teamId: 0,
      teamIntegrations: undefined,
      teamName: "",
      teamSettings: undefined,
      teamSlug: "",
      teamTheme: undefined,
    }),
});
