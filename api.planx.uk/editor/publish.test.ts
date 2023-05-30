import supertest from "supertest";

import { queryMock } from "../tests/graphqlQueryMock";
import { authHeader } from "../tests/mockJWT";
import app from "../server";
import { Flow } from "../types";
import { flowWithInviteToPay } from "../tests/mocks/inviteToPayData";

beforeEach(() => {
  queryMock.mockQuery({
    name: "GetFlowData",
    matchOnVariables: false,
    data: {
      flows_by_pk: {
        data: mockFlowData,
      },
    },
  });

  queryMock.mockQuery({
    name: "GetMostRecentPublishedFlow",
    matchOnVariables: false,
    data: {
      flows_by_pk: {
        published_flows: [
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
      insert_published_flows_one: {
        data: mockFlowData,
      },
    },
  });
});

describe("publish", () => {
  it("does not update if there are no new changes", async () => {
    await supertest(app)
      .post("/flows/1/publish")
      .set(authHeader())
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
        flows_by_pk: {
          data: alteredFlow,
        },
      },
    });

    queryMock.mockQuery({
      name: "PublishFlow",
      matchOnVariables: false,
      data: {
        insert_published_flows_one: {
          data: alteredFlow,
        },
      },
    });

    await supertest(app)
      .post("/flows/1/publish")
      .set(authHeader())
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

describe("sections validation on diff", () => {
  it("does not update if there are sections in an external portal", async () => {
    const alteredFlow = {
      ...mockFlowData,
      externalPortalNodeId: {
        edges: ["newSectionNodeId"],
        type: 310,
      },
      newSectionNodeId: {
        type: 360,
      },
    };

    queryMock.mockQuery({
      name: "GetFlowData",
      matchOnVariables: false,
      data: {
        flows_by_pk: {
          data: alteredFlow,
        },
      },
    });

    await supertest(app)
      .post("/flows/1/diff")
      .set(authHeader())
      .expect(200)
      .then((res) => {
        expect(res.body).toEqual({
          alteredNodes: null,
          message: "Cannot publish an invalid flow",
          description:
            "Found Sections in one or more External Portals, but Sections are only allowed in main flow",
        });
      });
  });

  it("does not update if there are sections, but there is not a section in the first position", async () => {
    const flowWithSections: Flow["data"] = {
      _root: {
        edges: ["questionNode", "sectionNode"],
      },
      questionNode: {},
      sectionNode: {
        type: 360,
      },
    };

    queryMock.mockQuery({
      name: "GetFlowData",
      matchOnVariables: false,
      data: {
        flows_by_pk: {
          data: flowWithSections,
        },
      },
    });

    await supertest(app)
      .post("/flows/1/diff")
      .set(authHeader())
      .expect(200)
      .then((res) => {
        expect(res.body).toEqual({
          alteredNodes: null,
          message: "Cannot publish an invalid flow",
          description:
            "When using Sections, your flow must start with a Section",
        });
      });
  });
});

describe("invite to pay validation on diff", () => {
  it("does not update if invite to pay is enabled, but there is not a Send component", async () => {
    const { Send, ...invalidatedFlow } = flowWithInviteToPay;
    invalidatedFlow["_root"].edges?.splice(
      invalidatedFlow["_root"].edges?.indexOf("Send")
    );

    queryMock.mockQuery({
      name: "GetFlowData",
      matchOnVariables: false,
      data: {
        flows_by_pk: {
          data: invalidatedFlow,
        },
      },
    });

    await supertest(app)
      .post("/flows/1/diff")
      .set(authHeader())
      .expect(200)
      .then((res) => {
        expect(res.body.message).toEqual("Cannot publish an invalid flow");
        expect(res.body.description).toEqual(
          "When using Invite to Pay, your flow must have a Send"
        );
      });
  });

  it("does not update if invite to pay is enabled, but there is more than one Send component", async () => {
    const alteredFlow = {
      ...flowWithInviteToPay,
      secondSend: {
        type: 650,
        data: {
          destinations: ["bops", "email"],
        },
      },
    };

    queryMock.mockQuery({
      name: "GetFlowData",
      matchOnVariables: false,
      data: {
        flows_by_pk: {
          data: alteredFlow,
        },
      },
    });

    await supertest(app)
      .post("/flows/1/diff")
      .set(authHeader())
      .expect(200)
      .then((res) => {
        expect(res.body.message).toEqual("Cannot publish an invalid flow");
        expect(res.body.description).toEqual(
          "When using Invite to Pay, your flow must have exactly ONE Send. It can select many destinations"
        );
      });
  });

  it("does not update if invite to pay is enabled, but there is not a FindProperty (`_address`) component", async () => {
    const { FindProperty, ...invalidatedFlow } = flowWithInviteToPay;
    invalidatedFlow["_root"].edges?.splice(
      invalidatedFlow["_root"].edges?.indexOf("FindProperty")
    );

    queryMock.mockQuery({
      name: "GetFlowData",
      matchOnVariables: false,
      data: {
        flows_by_pk: {
          data: invalidatedFlow,
        },
      },
    });

    await supertest(app)
      .post("/flows/1/diff")
      .set(authHeader())
      .expect(200)
      .then((res) => {
        expect(res.body.message).toEqual("Cannot publish an invalid flow");
        expect(res.body.description).toEqual(
          "When using Invite to Pay, your flow must have a FindProperty"
        );
      });
  });

  it("does not update if invite to pay is enabled, but there is not a Checklist that sets `proposal.projectType`", async () => {
    const {
      Checklist,
      ChecklistOptionOne,
      ChecklistOptionTwo,
      ...invalidatedFlow
    } = flowWithInviteToPay;
    invalidatedFlow["_root"].edges?.splice(
      invalidatedFlow["_root"].edges?.indexOf("Checklist")
    );

    queryMock.mockQuery({
      name: "GetFlowData",
      matchOnVariables: false,
      data: {
        flows_by_pk: {
          data: invalidatedFlow,
        },
      },
    });

    await supertest(app)
      .post("/flows/1/diff")
      .set(authHeader())
      .expect(200)
      .then((res) => {
        expect(res.body.message).toEqual("Cannot publish an invalid flow");
        expect(res.body.description).toEqual(
          "When using Invite to Pay, your flow must have a Checklist that sets the passport variable `proposal.projectType`"
        );
      });
  });
});

const mockFlowData: Flow["data"] = {
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
