import type { TeamRole } from "@opensystemslab/planx-core/types";
import { graphql, HttpResponse } from "msw";
import server from "test/mockServer";

import { mockTeamMembersDataWithNoTeamEditors, mockUsersData } from "./users";

export const getUsersHandler = () =>
  graphql.query("GetUsersForTeam", () =>
    HttpResponse.json({
      data: { users: mockUsersData },
    }),
  );

export const failToAddUserHandler = () =>
  graphql.mutation("CreateAndAddEditorToTeam", () =>
    HttpResponse.json({
      errors: [{ message: "Unable to create user" }],
    }),
  );

export const getUsersWithNoTeamEditorHandler = () =>
  graphql.query("GetUsersForTeam", () =>
    HttpResponse.json({
      data: { users: mockTeamMembersDataWithNoTeamEditors },
    }),
  );

export const createTeamEditorHandler = () =>
  graphql.mutation("CreateAndAddEditorToTeam", ({ variables }) => {
    const { firstName, lastName, email } = variables;

    const createdMember = {
      id: 99,
      firstName: firstName,
      lastName: lastName,
      email: email,
      isPlatformAdmin: false,
      defaultTeamId: 2,
      teams: [
        {
          role: "teamEditor",
          team: { name: "Test Team", slug: "test", id: 2 },
        },
      ],
    };

    server.use(
      graphql.query("GetUsersForTeam", () =>
        HttpResponse.json({
          data: { users: [...mockUsersData, createdMember] },
        }),
      ),
    );

    return HttpResponse.json({
      data: { insertUsersOne: { id: createdMember.id, __typename: "users" } },
    });
  });

export const createTeamAdminHandler = () =>
  graphql.mutation("CreateAndAddAdminToTeam", ({ variables }) => {
    const { firstName, lastName, email, teamId } = variables;

    const createdMember = {
      id: 100,
      firstName: firstName,
      lastName: lastName,
      email: email,
      isPlatformAdmin: false,
      defaultTeamId: teamId,
      teams: [
        {
          role: "teamEditor",
          team: { name: "Test Team", slug: "test", id: teamId },
        },
        {
          role: "teamAdmin",
          team: { name: "Test Team", slug: "test", id: teamId },
        },
      ],
    };

    server.use(
      graphql.query("GetUsersForTeam", () =>
        HttpResponse.json({
          data: { users: [...mockUsersData, createdMember] },
        }),
      ),
    );

    return HttpResponse.json({
      data: { insertUsersOne: { id: createdMember.id, __typename: "users" } },
    });
  });

export const deleteUserHandler = () =>
  graphql.mutation("SoftDeleteUserById", () =>
    HttpResponse.json({
      data: {
        users: { id: 3, email: null, __typename: "users" },
      },
    }),
  );

export const updateUserOnlyHandler = () =>
  graphql.mutation("UpdateUser", ({ variables }) => {
    const { userId, userValues } = variables;

    const updatedUsers = mockUsersData.map((user) =>
      user.id === userId
        ? {
            ...user,
            firstName: userValues.first_name,
            lastName: userValues.last_name,
            email: userValues.email,
            teams: user.teams.map((team) => ({ ...team })),
          }
        : user,
    );

    server.use(
      graphql.query("GetUsersForTeam", () =>
        HttpResponse.json({
          data: { users: updatedUsers },
        }),
      ),
    );

    return HttpResponse.json({
      data: {
        update_users: {
          returning: [
            {
              id: userId,
              firstName: userValues.first_name,
              lastName: userValues.last_name,
              email: userValues.email,
              __typename: "users",
            },
          ],
        },
      },
    });
  });

export const updateUserAsTeamAdminHandler = () =>
  graphql.mutation("CreateTeamAdminOnly", ({ variables }) => {
    const { userId, teamId } = variables;

    const updatedUsers = mockUsersData.map((user) =>
      user.id === userId
        ? {
            ...user,
            teams: user.teams.map((team) =>
              team.team.id === teamId ? { ...team, role: "teamAdmin" } : team,
            ),
          }
        : user,
    );

    server.use(
      graphql.query("GetUsersForTeam", () =>
        HttpResponse.json({
          data: { users: updatedUsers },
        }),
      ),
    );

    return HttpResponse.json({
      data: {
        insert_team_members_one: {
          id: "12345678-1234-1234-1234-123456789abc",
        },
      },
    });
  });

export const updateUserAsTeamEditorHandler = () =>
  graphql.mutation("RemoveTeamAdminOnly", ({ variables }) => {
    const { userId, teamId } = variables;

    const updatedUsers = mockUsersData.map((user) =>
      user.id === userId
        ? {
            ...user,
            teams: user.teams.map((team) =>
              team.team.id === teamId ? { ...team, role: "teamEditor" } : team,
            ),
          }
        : user,
    );

    server.use(
      graphql.query("GetUsersForTeam", () =>
        HttpResponse.json({
          data: { users: updatedUsers },
        }),
      ),
    );

    return HttpResponse.json({
      data: {
        delete_team_members: {
          affected_rows: 1,
        },
      },
    });
  });

// TODO: tests for this and update user as teamEditor
export const addUserAsTeamEditorHandler = () =>
  graphql.mutation("AddExistingUserToTeamAsEditor", ({ variables }) => {
    const { userId, teamId } = variables;

    const newTeamEditor = {
      __typename: "users" as const,
      firstName: "abc",
      lastName: "123",
      email: "123abc@email.com",
      id: userId,
      isPlatformAdmin: false,
      isAnalyst: false,
      defaultTeamId: null,
      teams: [
        {
          role: "teamEditor" as TeamRole,
          team: { name: "Test Team", slug: "test", id: teamId },
        },
      ],
    };

    const updatedUsers = [...mockUsersData, newTeamEditor];

    server.use(
      graphql.query("GetUsersForTeam", () =>
        HttpResponse.json({
          data: { users: updatedUsers },
        }),
      ),
    );

    return HttpResponse.json({
      data: {
        insert_team_members_one: {
          id: "12345678-1234-1234-1234-123456789abc",
        },
      },
    });
  });

export const addUserAsTeamAdminHandler = () =>
  graphql.mutation("AddExistingUserToTeamAsAdmin", ({ variables }) => {
    const { userId, teamId } = variables;

    const newTeamAdmin = {
      __typename: "users" as const,
      firstName: "abc",
      lastName: "123",
      email: "123abc@email.com",
      id: userId,
      isPlatformAdmin: false,
      isAnalyst: false,
      defaultTeamId: null,
      teams: [
        {
          role: "teamEditor" as TeamRole,
          team: { name: "Test Team", slug: "test", id: teamId },
        },
        {
          role: "teamAdmin" as TeamRole,
          team: { name: "Test Team", slug: "test", id: teamId },
        },
      ],
    };

    const updatedUsers = [...mockUsersData, newTeamAdmin];

    server.use(
      graphql.query("GetUsersForTeam", () =>
        HttpResponse.json({
          data: { users: updatedUsers },
        }),
      ),
    );

    return HttpResponse.json({
      data: {
        insert_team_members: {
          affected_rows: 2,
        },
      },
    });
  });

export const getNoExistingUserHandler = () =>
  graphql.query("GetUserByEmail", () =>
    HttpResponse.json({
      data: { users: [] },
    }),
  );
