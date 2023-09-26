import { User, UserTeams } from "@opensystemslab/planx-core/types";
import { Team } from "types";
import type { StateCreator } from "zustand";

export interface UserStore {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  isPlatformAdmin: boolean;
  teams: UserTeams[];

  setUser: (user: User) => void;
  getUser: () => User;
  canUserEditTeam: (teamSlug: Team["slug"]) => boolean;
}

export const userStore: StateCreator<UserStore, [], [], UserStore> = (
  set,
  get,
) => ({
  id: 0,
  firstName: "",
  lastName: "",
  email: "",
  isPlatformAdmin: false,
  teams: [],

  setUser: (user: User) =>
    set({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      isPlatformAdmin: user.isPlatformAdmin,
      teams: user.teams,
    }),

  getUser: () => ({
    id: get().id,
    firstName: get().firstName,
    lastName: get().lastName,
    email: get().email,
    isPlatformAdmin: get().isPlatformAdmin,
    teams: get().teams,
  }),

  canUserEditTeam: (teamSlug) => {
    return (
      get().teams.filter(
        (team) =>
          (team.role === "teamEditor" && team.team.slug === teamSlug) ||
          get().isPlatformAdmin,
      ).length > 0
    );
  },
});
