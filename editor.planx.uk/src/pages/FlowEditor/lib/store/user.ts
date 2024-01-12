import { CoreDomainClient } from "@opensystemslab/planx-core";
import { Team, User, UserTeams } from "@opensystemslab/planx-core/types";
import axios from "axios";
import type { StateCreator } from "zustand";

import { EditorStore } from "./editor";

export interface UserStore {
  user?: User;
  jwt?: string;

  setUser: (user: User & { jwt: string }) => void;
  getUser: () => User | undefined;
  canUserEditTeam: (teamSlug: Team["slug"]) => boolean;
  initUserStore: () => Promise<void>;
}

export const userStore: StateCreator<
  UserStore & EditorStore,
  [],
  [],
  UserStore
> = (set, get) => ({
  setUser: ({ jwt, ...user }) => {
    const authenticatedClient = new CoreDomainClient({
      targetURL: process.env.REACT_APP_HASURA_URL!,
      auth: { jwt },
    });
    set({ $client: authenticatedClient });
    set({ jwt, user })
  },

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
    const currentUser = getUser();
    if (currentUser) return;

    const user = await getLoggedInUser();
    setUser(user);
  },
});

const getLoggedInUser = async () => {
  const url = `${process.env.REACT_APP_API_URL}/user/me`;
  try {
    const response = await axios.get<User & { jwt: string }>(url, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    throw Error("Failed to fetch user matching JWT cookie");
  }
};
