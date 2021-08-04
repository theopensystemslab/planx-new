const { QueryMock } = require("graphql-query-test-mock");

require("dotenv").config({ path: "./.env.test" });

const queryMock = new QueryMock();

beforeEach(() => {
  queryMock.setup(process.env.HASURA_GRAPHQL_URL);

  queryMock.mockQuery({
    name: "GetTeams",
    data: {
      teams: [{ id: 1 }],
    },
  });

  queryMock.mockQuery({
    name: "CreateApplication",
    matchOnVariables: false,
    data: {
      insert_bops_applications_one: { id: 22 },
    },
    variables: {
      destination_url:
        "https://southwark.bops.services/api/v1/planning_applications",
    },
  });

  queryMock.mockQuery({
    name: "GetFlowData",
    matchOnVariables: false,
    data: {
      flows_by_pk: {
        data: {
          _root: {
            edges: [
              "RYYckLE2cH",
              "R99ncwKifm",
              "3qssvGXmMO",
              "SEp0QeNsTS",
              "q8Foul9hRN",
              "4CJgXe8Ttl",
              "dnVqd6zt4N",
            ],
          },
          "3qssvGXmMO": {
            type: 9,
          },
          "4CJgXe8Ttl": {
            data: {
              flagSet: "Planning permission",
              overrides: {
                NO_APP_REQUIRED: {
                  heading: "wooo",
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
              feedbackCTA:
                "What did you think of this service? (takes 30 seconds)",
            },
            type: 725,
          },
          q8Foul9hRN: {
            data: {
              url: "http://localhost:7002/bops/southwark",
            },
            type: 650,
          },
        },
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
            data: {
              _root: {
                edges: [
                  "RYYckLE2cH",
                  "R99ncwKifm",
                  "3qssvGXmMO",
                  "SEp0QeNsTS",
                  "q8Foul9hRN",
                  "4CJgXe8Ttl",
                  "dnVqd6zt4N",
                ],
              },
              "3qssvGXmMO": {
                type: 9,
              },
              "4CJgXe8Ttl": {
                data: {
                  flagSet: "Planning permission",
                  overrides: {
                    NO_APP_REQUIRED: {
                      heading: "wooo",
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
                  feedbackCTA:
                    "What did you think of this service? (takes 30 seconds)",
                },
                type: 725,
              },
              q8Foul9hRN: {
                data: {
                  url: "http://localhost:7002/bops/southwark",
                },
                type: 650,
              },
            },
          },
        ],
      },
    },
  });
});
