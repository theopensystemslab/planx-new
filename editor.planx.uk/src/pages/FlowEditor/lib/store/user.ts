import { Team, User } from "types";
import type { StateCreator } from "zustand";

export interface UserStore {
  name: string;
  email: string;
  isPlatformAdmin: boolean;
  roles: { teamSlug: Team["slug"]; role: "teamEditor" | "teamViewer" }[] | [];

  setUser: (user: User) => void;
  getUser: () => User;
  canUserEditTeam: (teamSlug: Team["slug"]) => boolean;
}

export const userStore: StateCreator<UserStore, [], [], UserStore> = (
  set,
  get,
) => ({
  name: "",
  email: "",
  isPlatformAdmin: false,
  roles: [],

  setUser: (user) =>
    set({
      name: user.name,
      email: user.email,
      isPlatformAdmin: user.isPlatformAdmin,
      roles: user.roles,
    }),

  getUser: () => ({
    name: get().name,
    email: get().email,
    roles: get().roles,
    isPlatformAdmin: get().isPlatformAdmin,
  }),

  canUserEditTeam: (teamSlug) => {
    return (
      get().roles.filter(
        (r) =>
          (r.role === "teamEditor" && r.teamSlug === teamSlug) ||
          get().isPlatformAdmin,
      ).length > 0
    );
  },
});
