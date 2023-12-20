import { User, UserTeams } from "@opensystemslab/planx-core/types";
import axios from "axios";
import { _client } from "client";
import { Team } from "types";
import type { StateCreator } from "zustand";

export interface UserStore {
  user?: User;

  setUser: (user: User) => void;
  getUser: () => User | undefined;
  canUserEditTeam: (teamSlug: Team["slug"]) => boolean;
  initUserStore: () => Promise<void>;
}

export const userStore: StateCreator<UserStore, [], [], UserStore> = (
  set,
  get,
) => ({
  setUser: (user: User) => set({ user }),

  getUser: () => get().user,

  canUserEditTeam(teamSlug) {
    const user = get().getUser();
    if (!user) return false;

    const hasTeamEditorRole = (team: UserTeams) =>
      team.role === "teamEditor" && team.team.slug === teamSlug;

    return user.isPlatformAdmin || user.teams.some(hasTeamEditorRole);
  },

  async initUserStore() {
    const { getUser, setUser } = get();

    if (getUser()) return;

    const user = await getLoggedInUser();
    setUser(user);
  },
});

const getLoggedInUser = async () => {
  const url = `${process.env.REACT_APP_API_URL}/user/me`;
  try {
    const response = await axios.get<User>(url, { withCredentials: true });
    return response.data;
  } catch (error) {
    throw Error("Failed to fetch user matching JWT cookie");
  }
};
