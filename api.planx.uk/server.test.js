import supertest from "supertest";

import { queryMock } from "./tests/graphqlQueryMock";
import app from "./server";

it("works", async () => {
  await supertest(app)
    .get("/")
    .expect(200)
    .then((response) => {
      expect(response.body).toEqual({ hello: "world" });
    });
});

it("mocks hasura", async () => {
  queryMock.mockQuery({
    name: "GetTeams",
    data: {
      teams: [{ id: 1 }],
    },
  });

  await supertest(app)
    .get("/hasura")
    .expect(200)
    .then((res) => {
      expect(res.body).toEqual({ teams: [{ id: 1 }] });
    });
});

describe("authentication", () => {
  test("Failed login endpoint", async () => {
    await supertest(app)
      .get("/auth/login/failed")
      .expect(401)
      .then((res) => {
        expect(res.body).toEqual({ error: "user failed to authenticate." });
      });
  });
});