import { User, UserTeams } from "@opensystemslab/planx-core/types";
import gql from "graphql-tag";
import jwtDecode from "jwt-decode";
import { client } from "lib/graphql";
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
  initUserStore: (jwt: string) => void;
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
      get().isPlatformAdmin ||
      teamSlug === "templates" ||
      get().teams.filter((team) => team.role === "teamEditor" && team.team.slug === teamSlug).length > 0
    );
  },

  async initUserStore (jwt: string) {
    const email = (jwtDecode(jwt) as any)["email"];
    const users = await client.query({
      query: gql`
        query GetUserByEmail($email: String!) {
          users: users(where: { email: { _eq: $email } }) {
            id
            firstName: first_name
            lastName: last_name
            email
            isPlatformAdmin: is_platform_admin
            teams {
              role
              team {
                name
                slug
                id
              }
            }
          }
        }
      `,
      variables: { email },
    });

    const user: User = users.data.users[0];
    if (!user) throw new Error(`Failed to get user ${email}`);

    this.setUser(user);
  },
});
