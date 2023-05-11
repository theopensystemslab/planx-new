import supertest from "supertest";

import { queryMock } from "../tests/graphqlQueryMock";
import { authHeader } from "../tests/mockJWT";
import app from "../server";
import { Flow } from "../types";

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

it("does not update if there are sections in an external portal", async () => {
  const alteredFlow = {
    ...mockFlowData,
    "externalPortalNodeId": {
      edges: ["newSectionNodeId"],
      type: 310,
    },
    "newSectionNodeId": {
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
        description: "Found Sections in one or more External Portals, but Sections are only allowed in main flow",
      });
    });
});

it("does not update if there are sections, but there is not a section in the first position", async () => {
  const flowWithSections: Flow["data"] = {
    _root: {
      edges: ["questionNode", "sectionNode"]
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
        description: "When using Sections, your flow must start with a Section"
      });
    });
});

it.todo("does not update if invite to pay is enabled, but there is not a Send component");

it.todo("does not update if invite to pay is enabled, but there is not a FindProperty (`_address`) component");

it.todo("does not update if invite to pay is enabled, but there is not a Checklist that sets `proposal.projectType`");

it("updates published flow and returns altered nodes if there have been changes", async () => {
  const alteredFlow = {
    ...mockFlowData,
    "4CJgXe8Ttl": {
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
            id: "4CJgXe8Ttl",
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

const mockFlowData: Flow["data"] = {
  _root: {
    edges: [
      "sectionNodeId",
      "RYYckLE2cH",
      "R99ncwKifm",
      "3qssvGXmMO",
      "SEp0QeNsTS",
      "q8Foul9hRN",
      "4CJgXe8Ttl",
      "dnVqd6zt4N",
    ],
  },
  "sectionNodeId": {
    type: 360,
    data: {
      title: "Section 1",
    },
  },
  "3qssvGXmMO": {
    type: 9,
  },
  "4CJgXe8Ttl": {
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
  "5sWfsvXphd": {
    data: {
      text: "?",
    },
    type: 200,
  },
  BV2VJhOC0I: {
    data: {
      text: "internal question",
    },
    type: 100,
    edges: ["ScjaYmpbVK", "b7j9tq22dj"],
  },
  OL9JENldcI: {
    data: {
      text: "!!",
    },
    type: 200,
  },
  R99ncwKifm: {
    data: {
      text: "portal",
    },
    type: 300,
    edges: ["BV2VJhOC0I"],
  },
  RYYckLE2cH: {
    data: {
      text: "Question",
    },
    type: 100,
    edges: ["5sWfsvXphd", "OL9JENldcI"],
  },
  SEp0QeNsTS: {
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
  ScjaYmpbVK: {
    data: {
      text: "?",
    },
    type: 200,
  },
  b7j9tq22dj: {
    data: {
      text: "*",
    },
    type: 200,
  },
  dnVqd6zt4N: {
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
  q8Foul9hRN: {
    data: {
      url: "http://localhost:7002/bops/southwark",
    },
    type: 650,
  },
};
