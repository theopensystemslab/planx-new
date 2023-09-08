import { Team, User } from "types";
import type { StateCreator } from "zustand";

export interface UserStore {
  name: string;
  email: string;
  isPlatformAdmin: boolean;
  roles: { teamSlug: Team["slug"]; role: "teamEditor" | "teamViewer" }[] | [];

  setUser: (user: User) => void;
  getUser: () => User;
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
    isPlatformAdmin: get().isPlatformAdmin,
    roles: get().roles,
  }),
});
