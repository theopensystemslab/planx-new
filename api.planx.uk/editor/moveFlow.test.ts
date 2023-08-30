import supertest from "supertest";

import { queryMock } from "../tests/graphqlQueryMock";
import { authHeader } from "../tests/mockJWT";
import app from "../server";

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
      update_flows_by_pk: {
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

it("moves a flow to a new team", async () => {
  await supertest(app)
    .post("/flows/1/move/new-team")
    .set(authHeader())
    .expect(200)
    .then((res) => {
      expect(res.body).toEqual({
        message: "Successfully moved flow to new-team",
      });
    });
});
