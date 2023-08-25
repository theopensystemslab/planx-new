import { GeoJSONObject } from "@turf/helpers";
import { NotifyPersonalisation, TeamSettings } from "types";
import { TeamTheme } from "types";
import { Team } from "types";
import type { StateCreator } from "zustand";

export interface TeamStore {
  teamTheme?: TeamTheme;
  teamName: string;
  teamSettings?: TeamSettings;
  teamSlug: string;
  notifyPersonalisation?: NotifyPersonalisation;
  boundaryBBox?: GeoJSONObject;

  setTeam: (team: Team) => void;
  getTeam: () => Team;
}

export const teamStore: StateCreator<TeamStore, [], [], TeamStore> = (
  set,
  get,
) => ({
  teamTheme: undefined,
  teamName: "",
  teamSettings: undefined,
  teamSlug: "",
  notifyPersonalisation: undefined,
  boundaryBBox: undefined,

  setTeam: (team) =>
    set({
      teamTheme: team.theme,
      teamName: team.name,
      teamSettings: team.settings,
      teamSlug: team.slug,
      notifyPersonalisation: team.notifyPersonalisation,
      boundaryBBox: team.boundaryBBox,
    }),

  getTeam: () => ({
    name: get().teamName,
    slug: get().teamSlug,
    settings: get().teamSettings,
    theme: get().teamTheme,
    notifyPersonalisation: get().notifyPersonalisation,
    boundaryBBox: get().boundaryBBox,
  }),
});
