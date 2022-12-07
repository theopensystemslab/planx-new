import supertest from "supertest";
import app from "../server";
import { queryMock } from "../tests/graphqlQueryMock";

const { post } = supertest(app);
const ENDPOINT = "/webhooks/hasura/delete-expired-sessions";

describe("Delete expired sessions webhook", () => {
  afterEach(() => queryMock.reset());

  it("fails without correct authentication", async () => {
    await post(ENDPOINT)
      .expect(401)
      .then((response) => {
        expect(response.body).toEqual({
          error: "Unauthorised",
        });
      });
  });

  it("returns a positive response with authentication", async () => {
    queryMock.mockQuery({
      name: "HardDeleteExpiredSessions",
      data: {
        delete_lowcal_sessions: {
          returning: [
            { id: "abc123" },
            { id: "xyz789" },
          ]
        }
      },
      ignoreThesePropertiesInVariables: [
        "oneWeekAgo"
      ]
    });

    await post(ENDPOINT)
      .set({ Authorization: process.env.HASURA_PLANX_API_KEY })
      .expect(200)
      .then((response) => {
        expect(response.body).toEqual({
          deletedSessions: ["abc123", "xyz789"],
        });
      });
  });

  it("returns an error when the query fails", async () => {
    queryMock.mockQuery({
      name: "HardDeleteExpiredSessions",
      data: {},
      graphqlErrors: [
        { error: "Query failed"}
      ],
      ignoreThesePropertiesInVariables: [
        "oneWeekAgo"
      ]
    });

    await post(ENDPOINT)
      .set({ Authorization: process.env.HASURA_PLANX_API_KEY })
      .expect(500)
      .then((response) => {
        expect(response.body.error).toMatch(/Failed to delete sessions/)
      });
  });
});

