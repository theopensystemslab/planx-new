import type {
  Team,
  TeamIntegrations,
  TeamSettings,
  TeamTheme,
} from "@opensystemslab/planx-core/types";
import { DEFAULT_PRIMARY_COLOR } from "theme";
import type { StateCreator } from "zustand";

import type { SharedStore } from "./shared";

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

const generateCircleFavicon = (color: string): string => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="${color}"/></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

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

    const favicon = document.getElementById("favicon") as HTMLLinkElement;
    if (team.theme?.favicon) {
      favicon.href = team.theme.favicon;
    } else {
      const color = team.theme?.primaryColour ?? DEFAULT_PRIMARY_COLOR;
      favicon.href = generateCircleFavicon(color);
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
