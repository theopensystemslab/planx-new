import type { User } from "@opensystemslab/planx-core/types";

import { DEMO_TEAM_ID } from "../../types";

export const mockUsersData: (User & { __typename: "users" })[] = [
  {
    __typename: "users",
    firstName: "Donella",
    lastName: "Meadows",
    // @ts-ignore
    email: null,
    id: 1,
    isPlatformAdmin: false,
    isAnalyst: false,
    defaultTeamId: null,
    teams: [
      { role: "teamEditor", team: { name: "Test Team", slug: "test", id: 1 } },
    ],
  },
  {
    __typename: "users",
    firstName: "Bill",
    lastName: "Sharpe",
    email: "bill@example.com",
    id: 2,
    isPlatformAdmin: true,
    isAnalyst: false,
    defaultTeamId: null,
    teams: [],
  },
  {
    __typename: "users",
    firstName: "Bilbo",
    lastName: "Baggins",
    email: "bil.bags@email.com",
    id: 3,
    isPlatformAdmin: false,
    isAnalyst: false,
    defaultTeamId: null,
    teams: [
      { role: "teamEditor", team: { name: "Test Team", slug: "test", id: 1 } },
    ],
  },
];

export const mockPlainUser: User = {
  isPlatformAdmin: false,
  isAnalyst: false,
  firstName: "r",
  lastName: "r",
  email: "r",
  id: 909,
  teams: [
    {
      role: "teamEditor",
      team: {
        name: "planX",
        slug: "planx",
        id: 0,
      },
    },
  ],
  defaultTeamId: null,
};

export const mockPlatformAdminUser: User = {
  ...mockPlainUser,
  isPlatformAdmin: true,
};

export const newDemoMember: User = {
  id: 99,
  firstName: "Mickey",
  lastName: "Mouse",
  email: "mickeymouse@email.com",
  isPlatformAdmin: false,
  isAnalyst: false,
  defaultTeamId: DEMO_TEAM_ID,
  teams: [
    {
      role: "demoUser",
      team: { name: "Demo Team", slug: "demo", id: DEMO_TEAM_ID },
    },
  ],
};

export const newMember: User = {
  id: 99,
  firstName: "Mickey",
  lastName: "Mouse",
  email: "mickeymouse@email.com",
  isPlatformAdmin: false,
  isAnalyst: false,
  defaultTeamId: 2,
  teams: [
    { role: "teamEditor", team: { name: "Test Team", slug: "test", id: 2 } },
  ],
};

export const mockTeamMembersDataWithNoTeamEditors: User[] = [
  {
    firstName: "Donella",
    lastName: "Meadows",
    email: "donella@example.com",
    id: 1,
    isPlatformAdmin: true,
    isAnalyst: false,
    defaultTeamId: null,
    teams: [],
  },
];
