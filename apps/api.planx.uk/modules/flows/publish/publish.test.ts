import supertest from "supertest";

import { queryMock } from "../../../tests/graphqlQueryMock.js";
import { authHeader, getTestJWT } from "../../../tests/mockJWT.js";
import app from "../../../server.js";
import { userContext } from "../../auth/middleware.js";
import { mockFlowData } from "../../../tests/mocks/validateAndPublishMocks.js";
import { createScheduledEvent } from "../../../lib/hasura/metadata/index.js";
import type { MockedFunction } from "vitest";

vi.mock("../../../lib/hasura/metadata");
const mockedCreateScheduledEvent = createScheduledEvent as MockedFunction<
  typeof createScheduledEvent
>;

beforeAll(() => {
  const getStoreMock = vi.spyOn(userContext, "getStore");
  getStoreMock.mockReturnValue({
    user: {
      sub: "123",
      jwt: getTestJWT({ role: "teamEditor" }),
    },
  });
});

beforeEach(() => {
  queryMock.mockQuery({
    name: "GetFlowData",
    matchOnVariables: false,
    data: {
      flow: {
        data: mockFlowData,
        slug: "mock-flow-name",
        team_id: 1,
        team: {
          slug: "testing",
        },
        publishedFlows: [{ data: mockFlowData }],
      },
    },
  });

  queryMock.mockQuery({
    name: "GetMostRecentPublishedFlow",
    matchOnVariables: false,
    data: {
      flow: {
        publishedFlows: [
          {
            data: mockFlowData,
          },
        ],
      },
    },
  });

  queryMock.mockQuery({
    name: "PublishFlow",
    matchOnVariables: false,
    data: {
      publishedFlow: {
        data: mockFlowData,
      },
    },
  });
});

const auth = authHeader({ role: "platformAdmin" });
const mockEndpoint = "/flows/1/publish?summary=test";

it("requires a user to be logged in", async () => {
  await supertest(app).post("/flows/1/publish").expect(401);
});

it("requires a user to have the 'teamEditor' role", async () => {
  await supertest(app)
    .post(mockEndpoint)
    .set(authHeader({ role: "teamViewer" }))
    .expect(403);
});

it("requires the summary query param to be present", async () => {
  await supertest(app)
    .post(mockEndpoint.split("?")[0])
    .set(auth)
    .expect(400)
    .then((res) => {
      expect(res.body).toHaveProperty("issues");
      expect(res.body).toHaveProperty("name", "ZodError");
    });
});

describe("publish", () => {
  it("publishes for the first time", async () => {
    queryMock.mockQuery({
      name: "GetMostRecentPublishedFlow",
      matchOnVariables: false,
      data: {
        flow: {
          publishedFlows: [],
        },
      },
    });

    queryMock.mockQuery({
      name: "GetSubmissionEmail",
      variables: {
        flow_id: "1",
      },
      data: {
        flowIntegrations: [
          {
            email_id: "mock-email-id",
          },
        ],
      },
    });

    await supertest(app).post(mockEndpoint).set(auth).expect(200);
  });

  it("does not update if there are no new changes", async () => {
    await supertest(app)
      .post(mockEndpoint)
      .set(auth)
      .expect(200)
      .then((res) => {
        expect(res.body).toEqual({
          message: "No new changes to publish",
        });
      });
  });

  it("updates published flow and returns altered nodes if there have been changes", async () => {
    const alteredFlow = {
      ...mockFlowData,
      ResultNode: {
        data: {
          flagSet: "Planning permission",
          overrides: {
            "flag.pp.permittedDevelopment": {
              heading: "Some Other Heading",
            },
          },
        },
        type: 3,
      },
    };

    queryMock.mockQuery({
      name: "GetFlowData",
      matchOnVariables: false,
      data: {
        flow: {
          data: alteredFlow,
          slug: "altered-flow-name",
          team_id: 1,
          team: {
            slug: "testing",
          },
          publishedFlows: [{ data: alteredFlow }],
        },
      },
    });

    queryMock.mockQuery({
      name: "GetSubmissionEmail",
      variables: {
        flow_id: "1",
      },
      data: {
        flowIntegrations: [
          {
            email_id: "mock-email-id",
          },
        ],
      },
    });

    queryMock.mockQuery({
      name: "PublishFlow",
      matchOnVariables: false,
      data: {
        publishedFlow: {
          data: alteredFlow,
        },
      },
    });

    await supertest(app)
      .post(mockEndpoint)
      .set(auth)
      .expect(200)
      .then((res) => {
        expect(res.body).toEqual({
          message: "Changes published",
          alteredNodes: [
            {
              id: "ResultNode",
              type: 3,
              data: {
                flagSet: "Planning permission",
                overrides: {
                  "flag.pp.permittedDevelopment": {
                    heading: "Some Other Heading",
                  },
                },
              },
            },
          ],
        });
      });
  });

  it("throws an error if user details are missing", async () => {
    const getStoreMock = vi.spyOn(userContext, "getStore");
    getStoreMock.mockReturnValue(undefined);

    await supertest(app)
      .post(mockEndpoint)
      .set(auth)
      .expect(500)
      .then((res) => {
        expect(res.body.error).toMatch(/User details missing from request/);
      });
  });
});
