import { graphql, HttpResponse } from "msw";
import server from "test/mockServer";

import {
  mockTeamMembersDataWithNoTeamEditors,
  mockUsersData,
  newDemoMember,
  newMember,
} from "./users";

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

export const addDemoUserHandler = () =>
  graphql.mutation("CreateAndAddUserToTeam", () => {
    server.use(
      graphql.query("GetUsersForTeam", () =>
        HttpResponse.json({
          data: { users: [...mockUsersData, newDemoMember] },
        }),
      ),
    );
    return HttpResponse.json({
      data: { insertUsersOne: { id: newDemoMember.id, __typename: "users" } },
    });
  });

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
  graphql.mutation("CreateAndAddUserToTeam", () => {
    server.use(
      graphql.query("GetUsersForTeam", () =>
        HttpResponse.json({
          data: { users: [...mockUsersData, newMember] },
        }),
      ),
    );
    return HttpResponse.json({
      data: { insertUsersOne: { id: newMember.id, __typename: "users" } },
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
  graphql.mutation("UpdateUser", () =>
    HttpResponse.json({
      data: {
        update_users: {
          returning: [
            {
              id: 3,
              firstName: "Bilbobo",
              lastName: "Baggins",
              email: "bil.bags@email.com",
              __typename: "users",
            },
          ],
        },
      },
    }),
  );

export const getNoExistingUserHandler = () =>
  graphql.query("GetUserByEmail", () =>
    HttpResponse.json({
      data: { users: [] },
    }),
  );