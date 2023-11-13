import supertest from "supertest";

import { queryMock } from "../../../tests/graphqlQueryMock";
import { authHeader, getJWT } from "../../../tests/mockJWT";
import app from "../../../server";
import { FlowGraph } from "@opensystemslab/planx-core/types";
import { userContext } from "../../auth/middleware";

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
});

const mockFlowData: FlowGraph = {
  _root: {
    edges: [
      "SectionOne",
      "QuestionOne",
      "InternalPortalNode",
      "FindPropertyNode",
      "PayNode",
      "SendNode",
      "ResultNode",
      "ConfirmationNode",
    ],
  },
  SectionOne: {
    type: 360,
    data: {
      title: "Section 1",
    },
  },
  FindPropertyNode: {
    type: 9,
  },
  ResultNode: {
    data: {
      flagSet: "Planning permission",
      overrides: {
        NO_APP_REQUIRED: {
          heading: "Congratulations!",
        },
      },
    },
    type: 3,
  },
  AnswerOne: {
    data: {
      text: "?",
    },
    type: 200,
  },
  QuestionInPortal: {
    data: {
      text: "internal question",
    },
    type: 100,
    edges: ["AnswerInPortalOne", "AnswerInPortalTwo"],
  },
  AnswerTwo: {
    data: {
      text: "!!",
    },
    type: 200,
  },
  InternalPortalNode: {
    data: {
      text: "portal",
    },
    type: 300,
    edges: ["QuestionInPortal"],
  },
  QuestionOne: {
    data: {
      text: "Question",
    },
    type: 100,
    edges: ["AnswerOne", "AnswerTwo"],
  },
  PayNode: {
    data: {
      fn: "application.fee.payable",
      url: "http://localhost:7002/pay",
      color: "#EFEFEF",
      title: "Pay for your application",
      description:
        '<p>The planning fee covers the cost of processing your application.         Find out more about how planning fees are calculated          <a href="https://www.gov.uk/guidance/fees-for-planning-applications" target="_self">here</a>.</p>',
    },
    type: 400,
  },
  AnswerInPortalOne: {
    data: {
      text: "?",
    },
    type: 200,
  },
  AnswerInPortalTwo: {
    data: {
      text: "*",
    },
    type: 200,
  },
  ConfirmationNode: {
    data: {
      heading: "Application sent",
      moreInfo:
        "<h2>You will be contacted</h2>\n<ul>\n<li>if there is anything missing from the information you have provided so far</li>\n<li>if any additional information is required</li>\n<li>to arrange a site visit, if required</li>\n<li>to inform you whether a certificate has been granted or not</li>\n</ul>\n",
      contactInfo:
        '<p>You can contact us at <a href="mailto:planning@lambeth.gov.uk" target="_self"><strong>planning@lambeth.gov.uk</strong></a></p>\n',
      description:
        "A payment receipt has been emailed to you. You will also receive an email to confirm when your application has been received.",
      feedbackCTA: "What did you think of this service? (takes 30 seconds)",
    },
    type: 725,
  },
  SendNode: {
    data: {
      url: "http://localhost:7002/bops/southwark",
    },
    type: 650,
  },
};
