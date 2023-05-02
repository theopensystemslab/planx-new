import { TeamSettings } from "types";
import { TeamTheme } from "types";
import { Team } from "types";
import type { StateCreator } from "zustand";

export interface TeamStore {
  teamTheme?: TeamTheme;
  teamName: string;
  teamSettings?: TeamSettings;
  teamSlug: string;
  notifyPersonalisation: any;

  setTeam: (team: Team) => void;
}

export const teamStore: StateCreator<TeamStore, [], [], TeamStore> = (
  set,
  get
) => ({
  teamTheme: undefined,
  teamName: "",
  teamSettings: undefined,
  teamSlug: "",
  notifyPersonalisation: {},

  setTeam: (team) =>
    set({
      teamTheme: team.theme,
      teamName: team.name,
      teamSettings: team.settings,
      teamSlug: team.slug,
    }),
});
