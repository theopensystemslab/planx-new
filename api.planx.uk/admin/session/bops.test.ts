import supertest from "supertest";
import app from "../../server";
import { authHeader } from "../../tests/mockJWT";
import { queryMock } from "../../tests/graphqlQueryMock";
import { expectedPayload, mockFlow, mockSession } from "../../tests/mocks/bopsMocks";

const endpoint = (strings: TemplateStringsArray) => `/admin/session/${strings[0]}/bops`;

describe("BOPS payload admin endpoint", () => {
  beforeEach(() => {
    queryMock.mockQuery({
      name: "GetSessionById",
      variables: {
        id: "123",
      },
      data: {
        lowcal_sessions_by_pk: mockSession,
      },
    });

    queryMock.mockQuery({
      name: "GetLatestPublishedFlowData",
      variables: {
        flowId: "456",
      },
      data: {
        published_flows: [
          {
            data: mockFlow,
          },
        ],
      },
    });

    queryMock.mockQuery({
      name: "GetFlowSlug",
      variables: {
        flowId: "456",
      },
      data: {
        flows_by_pk: {
          slug: "apply-for-a-lawful-development-certificate",
        },
      },
    });
  });

  afterEach(() => jest.clearAllMocks());

  it("requires a user to be logged in", async () => {
    await supertest(app)
      .get(endpoint`123`)
      .expect(401)
      .then(res => expect(res.body).toEqual({
        error: "No authorization token was found",
      }));
  });

  it("returns a JSON payload", async () => {
    await supertest(app)
      .get(endpoint`123`)
      .set(authHeader())
      .expect(200)
      .expect("content-type", "application/json; charset=utf-8")
      .then(res => expect(res.body).toEqual(expectedPayload));
  });
});
