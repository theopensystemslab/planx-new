import { queryMock } from "../../../tests/graphqlQueryMock.js";

beforeEach(() => {
  queryMock.mockQuery({
    name: "GetTeamBySlug",
    variables: {
      slug: "new-team",
    },
    data: {
      teams: [
        {
          id: "1",
        },
      ],
    },
  });

  queryMock.mockQuery({
    name: "UpdateFlow",
    variables: {
      id: "1",
      team_id: "1",
    },
    data: {
      flow: {
        id: "1",
      },
    },
  });
});

test.todo("returns an error if authorization headers are not set", async () => {
  return
});

test.todo("returns an error if the user does not have the 'teamEditor' role", async () => {
  return
});

test.todo("archives a flow", async () => {
return
});

test.todo("returns an error when the service errors", async () => {
  queryMock.reset();
  queryMock.mockQuery({
    name: "GetTeamBySlug",
    variables: {
      slug: "new-team",
    },
    data: {
      teams: null,
    },
    graphqlErrors: [
      {
        message: "Something went wrong",
      },
    ],
  });
return
});
