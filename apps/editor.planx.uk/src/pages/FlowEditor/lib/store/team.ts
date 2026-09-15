import type {
  Team,
  TeamSettings,
  TeamTheme,
} from "@opensystemslab/planx-core/types";
import { DEFAULT_PRIMARY_COLOR } from "theme";
import { setFavicon } from "utils/favicon";
import type { StateCreator } from "zustand";

import type { SharedStore } from "./shared";

export type TeamSummary = Pick<Team, "id" | "name" | "slug"> & {
  settings: Pick<TeamSettings, "isTrial">;
} & { theme: Pick<TeamTheme, "primaryColour" | "logo"> };

export interface TeamStore {
  teamId: number;
  teamName: string;
  teamSettings: TeamSettings;
  teamSlug: string;
  teamTheme: TeamTheme;
  teamDomain: string;

  setTeam: (team: Team, options?: { useCustomFavicon?: boolean }) => void;
  getTeam: () => Team;
  clearTeamStore: () => void;
}

const generateCircleFavicon = (color: string): string => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><circle cx="16" cy="16" r="12" fill="${color}"/></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

export const teamStore: StateCreator<
  TeamStore & SharedStore,
  [],
  [],
  TeamStore
> = (set, get) => ({
  teamId: 0,
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

  setTeam: (team, options = { useCustomFavicon: true }) => {
    set({
      teamId: team.id,
      teamName: team.name,
      teamSettings: team.settings,
      teamSlug: team.slug,
      teamTheme: team.theme,
      teamDomain: team.domain,
    });

    if (options.useCustomFavicon && team.theme?.favicon) {
      setFavicon(team.theme.favicon);
    } else {
      const color = team.theme?.primaryColour ?? DEFAULT_PRIMARY_COLOR;
      setFavicon(generateCircleFavicon(color));
    }
  },

  getTeam: () => ({
    id: get().teamId,
    name: get().teamName,
    settings: get().teamSettings,
    slug: get().teamSlug,
    theme: get().teamTheme,
    domain: get().teamDomain,
  }),

  clearTeamStore: () =>
    set({
      teamId: 0,
      teamName: "",
      teamSettings: undefined,
      teamSlug: "",
      teamTheme: undefined,
    }),
});
