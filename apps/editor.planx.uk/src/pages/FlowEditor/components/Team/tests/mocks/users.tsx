import type { User } from "@opensystemslab/planx-core/types";

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
      { role: "teamEditor", team: { name: "Test Team", slug: "test", id: 2 } },
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
      { role: "teamEditor", team: { name: "Test Team", slug: "test", id: 2 } },
    ],
  },
  {
    __typename: "users",
    firstName: "Donald",
    lastName: "Duck",
    email: "donaldduck@email.com",
    id: 4,
    isPlatformAdmin: true,
    isAnalyst: false,
    defaultTeamId: null,
    teams: [
      { role: "teamEditor", team: { name: "Test Team", slug: "test", id: 2 } },
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
        name: "Test Team",
        slug: "test",
        id: 2,
      },
    },
  ],
  defaultTeamId: null,
};

export const mockPlatformAdminUser: User = {
  ...mockPlainUser,
  isPlatformAdmin: true,
};

export const mockTeamAdminUser: User = {
  ...mockPlainUser,
  teams: [
    {
      role: "teamEditor",
      team: { name: "Test Team", slug: "test", id: 2 },
    },
    {
      role: "teamAdmin",
      team: { name: "Test Team", slug: "test", id: 2 },
    },
  ],
};

export const newTeamEditor: User = {
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

export const newTeamAdmin: User = {
  id: 100,
  firstName: "Minnie",
  lastName: "Mouse",
  email: "minniemouse@email.com",
  isPlatformAdmin: false,
  isAnalyst: false,
  defaultTeamId: 2,
  teams: [
    { role: "teamAdmin", team: { name: "Test Team", slug: "test", id: 2 } },
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

export const mockUsersWithTeamAdmin = mockUsersData.map((user) =>
  user.id === 3
    ? {
        ...user,
        teams: [
          {
            role: "teamEditor" as const,
            team: { name: "Test Team", slug: "test", id: 2 },
          },
          {
            role: "teamAdmin" as const,
            team: { name: "Test Team", slug: "test", id: 2 },
          },
        ],
      }
    : user,
);
