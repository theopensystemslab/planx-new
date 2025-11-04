import supertest from "supertest";

import app from "../../../../server.js";
import { queryMock } from "../../../../tests/graphqlQueryMock.js";
import {
  mockSoftDeleteLowcalSession,
  MOCK_UUID,
} from "../../../../tests/mocks/lowcalSessionMocks.js";

const { post } = supertest(app);

describe("Soft delete lowcal session", () => {
  const ENDPOINT = "/webhooks/hasura/delete-session";

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("fails without correct authentication", async () => {
    await post(ENDPOINT)
      .expect(401)
      .then((response) => {
        expect(response.body).toEqual({
          error: "Unauthorised",
        });
      });
  });

  it("returns a 400 if a required value is missing or invalid", async () => {
    const missingPayload = { payload: null };
    const missingSessionId = { payload: {} };
    const invalidSessionId = { payload: { sessionId: "123" } };

    for (const body of [missingPayload, missingSessionId, invalidSessionId]) {
      await post(ENDPOINT)
        .set({ Authorization: process.env.HASURA_PLANX_API_KEY! })
        .send(body)
        .expect(400)
        .then((response) => {
          expect(response.body).toHaveProperty("name", "ZodError");
          expect(response.body).toHaveProperty("name", "ZodError");
        });
    }
  });

  it("returns a 200 on successful session deletion", async () => {
    const body = {
      payload: { sessionId: MOCK_UUID },
    };
    queryMock.mockQuery(mockSoftDeleteLowcalSession);

    await post(ENDPOINT)
      .set({ Authorization: process.env.HASURA_PLANX_API_KEY! })
      .send(body)
      .expect(200)
      .then((response) => {
        console.log(response.body);
        expect(response.body).toEqual({
          message: `Successfully marked session ${MOCK_UUID} as deleted`,
        });
      });
  });

  it("returns a 500 on GraphQL mutation failure", async () => {
    const body = {
      payload: { sessionId: MOCK_UUID },
    };
    const mockErrorDeleteSession = {
      ...mockSoftDeleteLowcalSession,
      graphqlErrors: [
        {
          message: "Database error",
        },
      ],
    };
    queryMock.mockQuery(mockErrorDeleteSession);

    await post(ENDPOINT)
      .set({ Authorization: process.env.HASURA_PLANX_API_KEY! })
      .send(body)
      .expect(500)
      .then((response) => {
        expect(response.body.error).toMatch(/Failed to delete session/);
      });
  });
});
