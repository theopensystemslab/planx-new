import supertest from "supertest";

import { queryMock } from "../../../tests/graphqlQueryMock.js";
import { authHeader, getTestJWT } from "../../../tests/mockJWT.js";
import app from "../../../server.js";
import { userContext } from "../../auth/middleware.js";
import { mockFlowData } from "../../../tests/mocks/validateAndPublishMocks.js";
import {
  applicationTypeFail,
  checklistApplicationTypePass,
  questionApplicationTypePass,
  setValueApplicationTypePass,
} from "../../../tests/mocks/applicationTypeCheckMocks.js";
import * as applicationTypes from "./service/applicationTypes.js";

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
      .post("/flows/1/publish")
      .set(auth)
      .expect(500)
      .then((res) => {
        expect(res.body.error).toMatch(/User details missing from request/);
      });
  });
});

describe("how 'is_statutory_application_Type' is updated when a service is published", () => {
  beforeEach(() => {
    const getStoreMock = vi.spyOn(userContext, "getStore");
    getStoreMock.mockReturnValue({
      user: {
        sub: "123",
        jwt: getTestJWT({ role: "teamEditor" }),
      },
    });
  });
  it("checks that is_statutory_application_type is true for SetValue component", async () => {
    const checkStatutoryApplicationMock = vi.spyOn(
      applicationTypes,
      "checkStatutoryApplicationTypes",
    );

    const alteredFlow = {
      ...mockFlowData,
      ...setValueApplicationTypePass,
    };

    queryMock.mockQuery({
      name: "GetFlowData",
      matchOnVariables: false,
      data: {
        flow: {
          data: alteredFlow,
          slug: "stat-app-set-value",
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
      .then(() => {
        const [isStatutoryApplicationType] =
          checkStatutoryApplicationMock.mock.results;
        expect(isStatutoryApplicationType.value).toEqual(true);
      });
  });
  it("checks whether is_statutory_application_type is true for Checklist component", async () => {
    const checkStatutoryApplicationMock = vi.spyOn(
      applicationTypes,
      "checkStatutoryApplicationTypes",
    );

    const alteredFlow = {
      ...mockFlowData,
      ...checklistApplicationTypePass,
    };

    queryMock.mockQuery({
      name: "GetFlowData",
      matchOnVariables: false,
      data: {
        flow: {
          data: alteredFlow,
          slug: "stat-app-checklist",
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
      .then(() => {
        const [isStatutoryApplicationType] =
          checkStatutoryApplicationMock.mock.results;
        expect(isStatutoryApplicationType.value).toEqual(true);
      });
  });
  it("checks is_statutory_application_type is true for Question component", async () => {
    const checkStatutoryApplicationMock = vi.spyOn(
      applicationTypes,
      "checkStatutoryApplicationTypes",
    );

    const alteredFlow = {
      ...mockFlowData,
      ...questionApplicationTypePass,
    };

    queryMock.mockQuery({
      name: "GetFlowData",
      matchOnVariables: false,
      data: {
        flow: {
          data: alteredFlow,
          slug: "stat-app-question",
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
      .then(() => {
        const [isStatutoryApplicationType] =
          checkStatutoryApplicationMock.mock.results;
        expect(isStatutoryApplicationType.value).toEqual(true);
      });
  });
  it("checks is_statutory_application_type is false when no application type matches schema", async () => {
    const checkStatutoryApplicationMock = vi.spyOn(
      applicationTypes,
      "checkStatutoryApplicationTypes",
    );

    const alteredFlow = {
      ...mockFlowData,
      ...applicationTypeFail,
    };

    queryMock.mockQuery({
      name: "GetFlowData",
      matchOnVariables: false,
      data: {
        flow: {
          data: alteredFlow,
          slug: "stat-app-fail",
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
      .then(() => {
        const [isStatutoryApplicationType] =
          checkStatutoryApplicationMock.mock.results;
        expect(isStatutoryApplicationType.value).toEqual(false);
      });
  });
});
