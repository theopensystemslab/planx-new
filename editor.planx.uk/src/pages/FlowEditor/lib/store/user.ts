import { User } from "@opensystemslab/planx-core/types";
import { _client } from "client";
import jwtDecode from "jwt-decode";
import { Team } from "types";
import type { StateCreator } from "zustand";

export interface UserStore {
  user?: User

  setUser: (user: User) => void;
  getUser: () => User | undefined;
  canUserEditTeam: (teamSlug: Team["slug"]) => boolean;
  initUserStore: (jwt: string) => Promise<void>;
}

export const userStore: StateCreator<UserStore, [], [], UserStore> = (
  set,
  get,
) => ({

  setUser: (user: User) => set({ user }),

  getUser: () => get().user,

  canUserEditTeam(teamSlug) {
    const user = this.getUser();
    if (!user) return false;
    
    return (
      user.isPlatformAdmin ||
      teamSlug === "templates" ||
        user.teams.filter(
        (team) => team.role === "teamEditor" && team.team.slug === teamSlug,
      ).length > 0
    );
  },

  async initUserStore(jwt: string) {
    const  { getUser, setUser } = get();
    
    if (getUser()) return;

    const id = (jwtDecode(jwt) as any)["sub"];
    const user = await _client.user.getById(id);
    if (!user) throw new Error(`Failed to get user with ID ${id}`);

    setUser(user);
  },
});
