const supertest = require("supertest");
const app = require("../server");
const { queryMock } = require("../tests/graphqlQueryMock");
const { buildContentFromSessions } = require("./resumeApplication");

const ENDPOINT = "/resume-application";
const TEST_EMAIL = "simulate-delivered@notifications.service.gov.uk"

const mockFlow = { 
  slug: "slug", 
  team: {
    slug: "teamName",
    notifyPersonalisation: {
      helpPhone: "test",
      helpEmail: "test",
      helpOpeningHours: "test",
    }
  }
};

describe("buildContentFromSessions function", () => {
  it("should return correctly formatted content for a single session", () => {
    const sessions = [{
      data: {
        passport: {
          data: {
            _address: {
              single_line_address: "1 High Street"
            },
            "property.type": ["house"]
          }
        }
      },
      id: 123,
      expiry_date: "1900-01-01T01:01:01.865452+00:00",
    }];

    const result = `Address: 1 High Street
      Project Type: house
      Expiry Date: 01/01/1900
      Link: example.com/team/flow/preview?sessionId=123`
    expect(buildContentFromSessions(sessions, "flow", "team")).toEqual(result);
  });

  it("should return correctly formatted content for multiple session", () => {
    const sessions = [{
      data: {
        passport: {
          data: {
            _address: {
              single_line_address: "1 High Street"
            },
            "property.type": ["house"]
          }
        }
      },
      id: 123,
      expiry_date: "1900-01-01T01:01:01.865452+00:00",
    },
    {
      data: {
        passport: {
          data: {
            _address: {
              single_line_address: "2 High Street"
            },
            "property.type": ["flat"]
          }
        }
      },
      id: 456,
      expiry_date: "1900-01-01T01:01:01.865452+00:00",
    },
    {
      data: {
        passport: {
          data: {
            _address: {
              single_line_address: "3 High Street"
            },
            "property.type": ["farm"]
          }
        }
      },
      id: 789,
      expiry_date: "1900-01-01T01:01:01.865452+00:00",
    }];
    const result = `Address: 1 High Street
      Project Type: house
      Expiry Date: 01/01/1900
      Link: example.com/team/flow/preview?sessionId=123\n\nAddress: 2 High Street
      Project Type: flat
      Expiry Date: 01/01/1900
      Link: example.com/team/flow/preview?sessionId=456\n\nAddress: 3 High Street
      Project Type: farm
      Expiry Date: 01/01/1900
      Link: example.com/team/flow/preview?sessionId=789`
    expect(buildContentFromSessions(sessions, "flow", "team")).toEqual(result)
  });

  it("should handle an empty address field", () => {
    const sessions = [{
      data: {
        passport: {
          // Missing address
          data: {
            "property.type": ["house"]
          }
        }
      },
      id: 123,
      expiry_date: "1900-01-01T01:01:01.865452+00:00",
    }];

    const result = `Address: Address not submitted
      Project Type: house
      Expiry Date: 01/01/1900
      Link: example.com/team/flow/preview?sessionId=123`
    expect(buildContentFromSessions(sessions, "flow", "team")).toEqual(result);
  });

  it("should handle an empty project type field", () => {
    const sessions = [{
      data: {
        passport: {
          data: {
            _address: {
              single_line_address: "1 High Street"
            },
            // Missing project type
          }
        }
      },
      id: 123,
      expiry_date: "1900-01-01T01:01:01.865452+00:00",
    }];

    const result = `Address: 1 High Street
      Project Type: Project type not submitted
      Expiry Date: 01/01/1900
      Link: example.com/team/flow/preview?sessionId=123`
    expect(buildContentFromSessions(sessions, "flow", "team")).toEqual(result);
  });

});

describe("Resume Application endpoint", () => {

  it("throws an error for if required data is missing", () => {

    const missingEmail = { flowId: "test", sessionId: 123 };
    const missingFlowId = { email: "test", sessionId: 123 };

    [missingEmail, missingFlowId].forEach(async (invalidBody) => {
      await supertest(app)
      .post(ENDPOINT)
      .send(invalidBody)
      .expect(400)
      .then(response => {
        expect(response.body).toHaveProperty("error", "Required value missing");
      });
    })
  });

  it("throws an error if a flowId is invalid", async () => {
    const flowId = 123;

    queryMock.mockQuery({
      name: 'ValidateRequest',
      data: { flows_by_pk: null, lowcal_sessions: null },
      variables: { flowId: flowId, email: TEST_EMAIL }
    });

    await supertest(app)
      .post(ENDPOINT)
      .send({ email: TEST_EMAIL, flowId: flowId})
      .expect(500)
      .then(response => {
        expect(response.body).toHaveProperty("error", "Unable to validate request");
    });
  });
  
  it("sends a Notify email on successful resume", async () => {
    const flowId = 123;

    queryMock.mockQuery({
      name: 'ValidateRequest',
      data: {
        lowcal_sessions: [{
          data: {
            passport: {
              data: {
                _address: {
                  single_line_address: "1 High Street"
                },
                "property.type": ["house"]
              }
            }
          },
          id: 123,
          expiry_date: "1900-01-01T01:01:01.865452+00:00",
        }],
        flows_by_pk: mockFlow
      },
      variables: {
        flowId: flowId,
        email: TEST_EMAIL,
      }
    });

    await supertest(app)
      .post(ENDPOINT)
      .send({
        email: TEST_EMAIL,
        flowId: flowId,
      })
      .expect(200)
  });

  it("give a successful response even if there is not a matching session", async () => {
    const flowId = 123;

    queryMock.mockQuery({
      name: 'ValidateRequest',
      data: { flows_by_pk: mockFlow, lowcal_sessions: null },
      variables: { flowId: flowId, email: TEST_EMAIL }
    });

    await supertest(app)
      .post(ENDPOINT)
      .send({ email: TEST_EMAIL, flowId: flowId})
      .expect(200);
  });
});