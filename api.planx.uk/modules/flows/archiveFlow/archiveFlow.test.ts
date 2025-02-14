import { queryMock } from "../../../tests/graphqlQueryMock.js";
import supertest from "supertest";
import app from "../../../server.js";
import { authHeader } from "../../../tests/mockJWT.js";

beforeEach(() => {
  queryMock.mockQuery({
    name: "ArchiveFlow",
    variables: {
      id: "1",
    },
    data: {
      flow: {
        id: "1",
        name: "ArchiveFlow",
      },
    },
  });
});

it("returns an error if authorization headers are not set", async () => {
  await supertest(app)
    .post("/flows/1/archive")
    .expect(401)
    .then((res) => {
      expect(res.body).toEqual({
        error: "No authorization token was found",
      });
    });
});

it("returns an error if the user does not have the 'teamEditor' role", async () => {
  await supertest(app)
    .post("/flows/1/archive")
    .set(authHeader({ role: "teamViewer" }))
    .expect(403);
});

it("archives a flow", async () => {
  await supertest(app)
    .post(`/flows/1/archive`)
    .set(authHeader({ role: "teamEditor" }))
    .expect(200)
    .then((res) => {
      expect(res.body).toEqual({
        message: `Successfully archived ArchiveFlow with id 1`,
      });
    });
});
