import supertest from "supertest";

import { queryMock } from "../../../tests/graphqlQueryMock";
import { authHeader } from "../../../tests/mockJWT";
import app from "../../../server";

beforeEach(() => {
  queryMock.mockQuery({
    name: "GetTeam",
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
