const nock = require("nock");
const supertest = require("supertest");
const loadOrRecordNockRequests = require("./tests/loadOrRecordNockRequests");

const { queryMock } = require("./tests/graphqlQueryMock");
const app = require("./server");
const { flowWithoutReview, FLOW_WITHOUT_REVIEW_ID, flowWithReview, FLOW_WITH_REVIEW_ID, SEARCH_FLOW_ID, searchFlow } = require("./tests/mocks/flowsMocks");
const { TYPES } = require("./types");

it("works", async () => {
  await supertest(app)
    .get("/")
    .expect(200)
    .then((response) => {
      expect(response.body).toEqual({ hello: "world" });
    });
});

it("mocks hasura", async () => {
  queryMock.mockQuery({
    name: "GetTeams",
    data: {
      teams: [{ id: 1 }],
    },
  });

  await supertest(app)
    .get("/hasura")
    .expect(200)
    .then((res) => {
      expect(res.body).toEqual({ teams: [{ id: 1 }] });
    });
});

[
  {
    env: "production",
    bopsApiRootDomain: "bops.services",
  },
  {
    env: "staging",
    bopsApiRootDomain: "bops-staging.services",
  },
].forEach(({ env, bopsApiRootDomain }) => {
  describe(`sending an application to BOPS ${env}`, () => {
    const ORIGINAL_BOPS_API_ROOT_DOMAIN = process.env.BOPS_API_ROOT_DOMAIN;

    beforeEach(() => {
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
    });

    beforeAll(() => {
      process.env.BOPS_API_ROOT_DOMAIN = bopsApiRootDomain;
    });

    afterAll(() => {
      process.env.BOPS_API_ROOT_DOMAIN = ORIGINAL_BOPS_API_ROOT_DOMAIN;
    });

    it("proxies request and returns hasura id", async () => {
      nock(
        `https://southwark.${bopsApiRootDomain}/api/v1/planning_applications`
      )
        .post("")
        .reply(200, {
          application: "0000123",
        });

      await supertest(app)
        .post("/bops/southwark")
        .send({ applicationId: 123 })
        .expect(200)
        .then((res) => {
          expect(res.body).toEqual({
            application: { id: 22, bopsResponse: { application: "0000123" } },
          });
        });
    });
  });
});

describe("sending a payment to GOV.UK Pay", () => {
  const govUKResponse = {
    amount: 12,
    reference: "a1234",
    state: {
      status: "success",
      finished: true,
    },
    payment_id: "a13345",
    created_date: "2021-04-30T20:26:34.416Z",
    _links: {
      next_url: {
        href: "https://gov.uk/pay/secret_token",
      },
    },
  };

  beforeEach(() => {
    nock("https://publicapi.payments.service.gov.uk/v1/payments")
      .post("")
      .reply(200, govUKResponse);
  });

  it("proxies request", async () => {
    await supertest(app)
      .post("/pay/southwark")
      .send({
        amount: 100,
        reference: "12343543",
        description: "New application",
        return_url: "https://editor.planx.uk",
      })
      .expect(200)
      .then((res) => {
        expect(res.body).toEqual(govUKResponse);
      });
  });
});

describe("fetching status of a GOV.UK payment", () => {
  // https://docs.payments.service.gov.uk/reporting/#get-information-about-a-single-payment
  const govUKResponse = {
    created_date: "2019-07-11T10:36:26.988Z",
    amount: 3750,
    state: {
      status: "success",
      finished: true,
    },
    description: "Pay your council tax",
    reference: "12345",
    language: "en",
    metadata: {
      ledger_code: "AB100",
      an_internal_reference_number: 200,
    },
    email: "sherlock.holmes@example.com",
    card_details: {
      card_brand: "Visa",
      card_type: "debit",
      last_digits_card_number: "1234",
      first_digits_card_number: "123456",
      expiry_date: "04/24",
      cardholder_name: "Sherlock Holmes",
      billing_address: {
        line1: "221 Baker Street",
        line2: "Flat b",
        postcode: "NW1 6XE",
        city: "London",
        country: "GB",
      },
    },
    payment_id: "hu20sqlact5260q2nanm0q8u93",
    refund_summary: {
      status: "available",
      amount_available: 4000,
      amount_submitted: 0,
    },
    settlement_summary: {
      capture_submit_time: "2019-07-12T17:15:000Z",
      captured_date: "2019-07-12",
      settled_date: "2019-07-12",
    },
    delayed_capture: false,
    moto: false,
    corporate_card_surcharge: 250,
    total_amount: 4000,
    fee: 200,
    net_amount: 3800,
    payment_provider: "worldpay",
    provider_id: "10987654321",
    return_url: "https://your.service.gov.uk/completed",
  };

  it("proxies request and returns filtered response object", async () => {
    nock("https://publicapi.payments.service.gov.uk")
      .get("/v1/payments/hu20sqlact5260q2nanm0q8u93")
      .reply(200, govUKResponse);

    await supertest(app)
      .get("/pay/southwark/hu20sqlact5260q2nanm0q8u93")
      .expect(200)
      .then((res) => {
        expect(res.body).toStrictEqual({
          payment_id: "hu20sqlact5260q2nanm0q8u93",
          amount: 3750,
          state: {
            status: "success",
            finished: true,
          },
        });
      });
  });
});

describe("fetching GIS data from local authorities directly", () => {
  const locations = [
    {
      council: "braintree",
      x: 575629.54,
      y: 223122.85,
      siteBoundary: [],
    },
  ];

  loadOrRecordNockRequests("fetching-direct-gis-data", locations);

  locations.forEach((location) => {
    it(`returns MVP planning constraints for ${location.council}`, async () => {
      await supertest(app)
        .get(`/gis/${location.council}?x=${location.x}&y=${location.y}&siteBoundary=${JSON.stringify(location.siteBoundary)}`)
        .expect(200)
        .then((res) => {
          expect(res.body["article4"]).toBeDefined();
          expect(res.body["listed"]).toBeDefined();
          expect(res.body["designated.conservationArea"]).toBeDefined();
        });
    }, 20_000); // 20s request timeout
  });
});

describe("fetching GIS data from Digital Land for supported local authorities", () => {
  const locations = [
    {
      council: "buckinghamshire",
      geom: "POINT(-1.0498956 51.8547901)"
    },
    {
      council: "canterbury",
      geom: "POINT(1.0803887 51.2811746)",
    },
    {
      council: "lambeth",
      geom: "POINT(-0.1198903 51.4922191)",
    },
    {
      council: "southwark",
      geom: "POINT(-0.0887039 51.5021734)",
    },
  ];

  loadOrRecordNockRequests("fetching-digital-land-gis-data", locations);

  locations.forEach((location) => {
    it(`returns MVP planning constraints from Digital Land for ${location.council}`, async () => {
      await supertest(app)
        .get(`/gis/${location.council}?geom=${location.geom}`)
        .expect(200)
        .then((res) => {
          expect(res.body["constraints"]["article4"]).toBeDefined();
          expect(res.body["constraints"]["listed"]).toBeDefined();
          expect(res.body["constraints"]["designated.conservationArea"]).toBeDefined();
        });
    }, 20_000); // 20s request timeout
  });
});

describe("validate flow has review", () => {

  const generateEmptyParentMock = () => {
    queryMock.mockQuery({
      name: 'GetParents',
      data: {
        get_parent_flows: []
      },
      matchOnVariables: false,
      persist: true,
      variables: {
        flow_id: ""
      }
    });
  }

  beforeEach(() => {
    queryMock.reset();
  });

  it("should return false for a flow without reviews", async () => {
    generateEmptyParentMock();

    queryMock.mockQuery({
      name: 'GetFlowByPK',
      data: {
        flows_by_pk: {
          data: flowWithoutReview,
          id: FLOW_WITHOUT_REVIEW_ID,
          slug: 'test',
          team: {
            slug: 'test-team'
          }
        }
      },
      variables: {
        id: FLOW_WITHOUT_REVIEW_ID,
      }
    });

    await supertest(app)
      .get(`/flows/${FLOW_WITHOUT_REVIEW_ID}/has-review`)
      .expect(200)
      .then((res) => {
        expect(res.body).toEqual({
          hasReview: false,
          placement: "",
          slug: ""
        });
      })
  });

  it("should return true for a flow with review", async () => {
    generateEmptyParentMock();

    queryMock.mockQuery({
      name: 'GetFlowByPK',
      data: {
        flows_by_pk: {
          data: flowWithReview,
          id: FLOW_WITH_REVIEW_ID,
          slug: 'test',
          team: {
            slug: 'test-team'
          }
        }
      },
      variables: {
        id: FLOW_WITH_REVIEW_ID,
      }
    });

    await supertest(app)
      .get(`/flows/${FLOW_WITH_REVIEW_ID}/has-review`)
      .expect(200)
      .then((res) => {
        expect(res.body).toEqual({
          hasReview: true,
          placement: "current",
          slug: "test-team/test"
        });
      })
  });

  it("should return true for a flow with a review inside a portal", async () => {
    generateEmptyParentMock();

    queryMock.mockQuery({
      name: 'GetFlowByPK',
      data: {
        flows_by_pk: {
          data: {
            ...flowWithoutReview,
            portal: {
              type: TYPES.ExternalPortal,
              data: {
                flowId: FLOW_WITH_REVIEW_ID,
              },
            }
          },
          id: FLOW_WITHOUT_REVIEW_ID,
          slug: 'test',
          team: {
            slug: 'test-team'
          }
        }
      },
      variables: {
        id: FLOW_WITHOUT_REVIEW_ID,
      }
    });

    queryMock.mockQuery({
      name: 'GetFlows',
      data: {
        flows: [{
          data: flowWithReview,
          id: FLOW_WITH_REVIEW_ID,
          slug: 'test-portal',
          team: {
            slug: 'test-portal-team'
          }
        }]
      },
      variables: {
        ids: [FLOW_WITH_REVIEW_ID]
      }
    })

    await supertest(app)
      .get(`/flows/${FLOW_WITHOUT_REVIEW_ID}/has-review`)
      .expect(200)
      .then((res) => {
        expect(res.body).toEqual({
          hasReview: true,
          placement: "child",
          slug: "test-portal-team/test-portal"
        });
      });
  });

  it("should return false for a with portal but without review", async () => {
    generateEmptyParentMock();

    queryMock.mockQuery({
      name: 'GetFlowByPK',
      data: {
        flows_by_pk: {
          data: {
            ...flowWithoutReview,
            portal: {
              type: TYPES.ExternalPortal,
              data: {
                flowId: FLOW_WITH_REVIEW_ID,
              },
            }
          },
          id: FLOW_WITHOUT_REVIEW_ID,
          slug: 'test',
          team: {
            slug: 'test-team'
          }
        }
      },
      variables: {
        id: FLOW_WITHOUT_REVIEW_ID,
      }
    });

    queryMock.mockQuery({
      name: 'GetFlows',
      data: {
        flows: [{ data: flowWithoutReview, id: FLOW_WITH_REVIEW_ID }]
      },
      variables: {
        ids: [FLOW_WITH_REVIEW_ID]
      }
    })

    await supertest(app)
      .get(`/flows/${FLOW_WITHOUT_REVIEW_ID}/has-review`)
      .expect(200)
      .then((res) => {
        expect(res.body).toEqual({
          hasReview: false,
          placement: "",
          slug: ""
        });
      });
  });

  it('should use memoized flows, preventing fetching searchFlow twice', async () => {
    generateEmptyParentMock();
    const randomFlowId = '200f59d2-6a71-4028-a16e-81e503b384ca';

    queryMock.mockQuery({
      name: 'GetFlowByPK',
      data: {
        flows_by_pk: {
          data: {
            ...flowWithoutReview,
            portal: {
              type: TYPES.ExternalPortal,
              data: {
                flowId: FLOW_WITH_REVIEW_ID,
              },
            },
            searchPortal: {
              type: TYPES.ExternalPortal,
              data: {
                flowId: SEARCH_FLOW_ID,
              },
            }
          },
          id: FLOW_WITHOUT_REVIEW_ID
        }
      },
      variables: {
        id: FLOW_WITHOUT_REVIEW_ID,
      }
    });

    queryMock.mockQuery({
      name: 'GetFlows',
      data: {
        flows: [
          {
            data: {
              ...flowWithoutReview,
              searchPortal: {
                type: TYPES.ExternalPortal,
                data: {
                  flowId: SEARCH_FLOW_ID,
                },
              },
            },
            id: randomFlowId
          },
          { data: searchFlow, id: SEARCH_FLOW_ID },
        ]
      },
      matchVariables: false,
      variables: {
        ids: [FLOW_WITH_REVIEW_ID, SEARCH_FLOW_ID]
      }
    });

    await supertest(app)
      .get(`/flows/${FLOW_WITHOUT_REVIEW_ID}/has-review`)
      .expect(200)
      .then((res) => {
        expect(res.body).toEqual({
          hasReview: false,
          placement: "",
          slug: "",
        });
      });

    // We should expect for 2 calls:
    // 1. Is the root flow, there is an exclusive query to fetch it.
    // 2. Is the query which fetches the root's flow portals. One of these portals is duplicated, so there shouldn’t be a third call in the next recursive call.
    expect(queryMock.getCalls().filter(call => call.id !== 'GetParents').length).toBe(2);
  });

  it("should return true for a flow used as a portal", async () => {
    queryMock.mockQuery({
      name: 'GetFlowByPK',
      data: {
        flows_by_pk: {
          data: flowWithoutReview,
          id: FLOW_WITHOUT_REVIEW_ID,
          slug: 'test',
          team: {
            slug: 'test-team'
          }
        }
      },
      variables: {
        id: FLOW_WITHOUT_REVIEW_ID,
      }
    });

    queryMock.mockQuery({
      name: 'GetParents',
      data: {
        get_parent_flows: [{
          id: FLOW_WITH_REVIEW_ID,
          data: {
            ...flowWithReview,
            portal: {
              type: TYPES.ExternalPortal,
              data: {
                flowId: FLOW_WITHOUT_REVIEW_ID,
              },
            }
          },
          slug: 'parent',
          team: {
            slug: 'parent-team'
          }
        }]
      },
      variables: {
        flow_id: FLOW_WITHOUT_REVIEW_ID,
      }
    });

    await supertest(app)
      .get(`/flows/${FLOW_WITHOUT_REVIEW_ID}/has-review`)
      .expect(200)
      .then((res) => {
        expect(res.body).toEqual({
          hasReview: true,
          placement: "parent",
          slug: "parent-team/parent"
        });
      })
  });
})
