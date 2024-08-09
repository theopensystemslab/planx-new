import supertest from "supertest";

import { queryMock } from "../../../tests/graphqlQueryMock.js";
import { authHeader } from "../../../tests/mockJWT.js";
import app from "../../../server.js";

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

it("returns an error if authorization headers are not set", async () => {
  await supertest(app)
    .post("/flows/1/move/new-team")
    .expect(401)
    .then((res) => {
      expect(res.body).toEqual({
        error: "No authorization token was found",
      });
    });
});

it("returns an error if the user does not have the 'teamEditor' role", async () => {
  await supertest(app)
    .post("/flows/1/move/new-team")
    .set(authHeader({ role: "teamViewer" }))
    .expect(403);
});

it("moves a flow to a new team", async () => {
  await supertest(app)
    .post("/flows/1/move/new-team")
    .set(authHeader({ role: "teamEditor" }))
    .expect(200)
    .then((res) => {
      expect(res.body).toEqual({
        message: "Successfully moved flow to new-team",
      });
    });
});

it("returns an error when the service errors", async () => {
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

  await supertest(app)
    .post("/flows/1/move/new-team")
    .set(authHeader({ role: "teamEditor" }))
    .expect(500)
    .then((res) => {
      expect(res.body.error).toMatch(/Failed to move flow/);
    });
});

it("returns an error for an invalid team", async () => {
  queryMock.reset();
  queryMock.mockQuery({
    name: "GetTeamBySlug",
    variables: {
      slug: "new-team",
    },
    data: {
      teams: [],
    },
  });

  await supertest(app)
    .post("/flows/1/move/new-team")
    .set(authHeader({ role: "teamEditor" }))
    .expect(500)
    .then((res) => {
      expect(res.body.error).toMatch(/Unable to find a team matching slug/);
    });
});
