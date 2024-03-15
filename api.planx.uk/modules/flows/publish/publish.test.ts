import supertest from "supertest";

import { queryMock } from "../../../tests/graphqlQueryMock";
import { authHeader, getJWT } from "../../../tests/mockJWT";
import app from "../../../server";
import { userContext } from "../../auth/middleware";
import { mockFlowData } from "../../../tests/mocks/validateAndPublishMocks";

beforeAll(() => {
  const getStoreMock = jest.spyOn(userContext, "getStore");
  getStoreMock.mockReturnValue({
    user: {
      sub: "123",
      jwt: getJWT({ role: "teamEditor" }),
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

it("requires a user to be logged in", async () => {
  await supertest(app).post("/flows/1/publish").expect(401);
});

it("requires a user to have the 'teamEditor' role", async () => {
  await supertest(app)
    .post("/flows/1/publish")
    .set(authHeader({ role: "teamViewer" }))
    .expect(403);
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

    await supertest(app).post("/flows/1/publish").set(auth).expect(200);
  });

  it("does not update if there are no new changes", async () => {
    await supertest(app)
      .post("/flows/1/publish")
      .set(auth)
      .expect(200)
      .then((res) => {
        expect(res.body).toEqual({
          alteredNodes: null,
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
            NO_APP_REQUIRED: {
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
      name: "PublishFlow",
      matchOnVariables: false,
      data: {
        publishedFlow: {
          data: alteredFlow,
        },
      },
    });

    await supertest(app)
      .post("/flows/1/publish")
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
                  NO_APP_REQUIRED: {
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
    const getStoreMock = jest.spyOn(userContext, "getStore");
    getStoreMock.mockReturnValue(undefined);

    await supertest(app)
      .post("/flows/1/publish")
      .set(auth)
      .expect(500)
      .then((res) => {
        expect(res.body.error).toMatch(/User details missing from request/);
      });
  });
});
