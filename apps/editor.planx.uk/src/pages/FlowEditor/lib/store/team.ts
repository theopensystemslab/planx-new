import type {
  Team,
  TeamSettings,
  TeamTheme,
} from "@opensystemslab/planx-core/types";
import { DEFAULT_PRIMARY_COLOR } from "theme";
import { getEnvironmentLogo } from "ui/icons/logos";
import { setFavicon } from "utils/favicon";
import type { StateCreator } from "zustand";

import type { SharedStore } from "./shared";

export type TeamSummary = Pick<Team, "id" | "name" | "slug"> & {
  isLpa: boolean;
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
      const colour = team.theme?.primaryColour ?? DEFAULT_PRIMARY_COLOR;
      setFavicon(getEnvironmentLogo(colour));
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
