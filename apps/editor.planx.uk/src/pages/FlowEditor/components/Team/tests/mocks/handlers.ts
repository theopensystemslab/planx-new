import { graphql, HttpResponse } from "msw";
import server from "test/mockServer";

import { mockTeamMembersDataWithNoTeamEditors, mockUsersData } from "./users";

export const createUserAlreadyExistsHandler = () =>
  graphql.mutation("CreateAndAddUserToTeam", () =>
    HttpResponse.json({
      errors: [
        {
          message:
            'Uniqueness violation. duplicate key value violates unique constraint "users_email_key"',
        },
      ],
    }),
  );

export const getUsersHandler = () =>
  graphql.query("GetUsersForTeam", () =>
    HttpResponse.json({
      data: { users: mockUsersData },
    }),
  );

export const failToAddUserHandler = () =>
  graphql.mutation("CreateAndAddUserToTeam", () =>
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

export const createUserHandler = () =>
  graphql.mutation("CreateAndAddUserToTeam", ({ variables }) => {
    const { role, firstName, lastName, email } = variables;

    const createdMember = {
      id: role === "teamAdmin" ? 100 : 99,
      firstName: firstName,
      lastName: lastName,
      email: email,
      isPlatformAdmin: false,
      defaultTeamId: 2,
      teams: [{ role }],
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

export const updateUserHandler = () =>
  graphql.mutation("UpdateUser", ({ variables }) => {
    const { userId, userValues, role } = variables;

    const updatedUsers = mockUsersData.map((user) =>
      user.id === userId
        ? {
            ...user,
            firstName: userValues.first_name,
            lastName: userValues.last_name,
            email: userValues.email,
            teams: user.teams.map((team) => ({ ...team, role })),
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
        update_team_members: {
          returning: [
            {
              role: role,
              userId: userId,
              teamId: variables.teamId,
            },
          ],
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
