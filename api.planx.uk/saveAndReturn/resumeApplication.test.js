const supertest = require("supertest");
const app = require("../server");
const { queryMock } = require("../tests/graphqlQueryMock");
const { buildContentFromSessions } = require("./resumeApplication");


const ENDPOINT = "/resume-application";
const TEST_EMAIL = "simulate-delivered@notifications.service.gov.uk"

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
    }];

    const result = `Address: 1 High Street
      Project Type: house
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
    }];
    const result = `Address: 1 High Street
      Project Type: house
      Link: example.com/team/flow/preview?sessionId=123\n\nAddress: 2 High Street
      Project Type: flat
      Link: example.com/team/flow/preview?sessionId=456\n\nAddress: 3 High Street
      Project Type: farm
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
    }];

    const result = `Address: Address not submitted
      Project Type: house
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
    }];

    const result = `Address: 1 High Street
      Project Type: Project type not submitted
      Link: example.com/team/flow/preview?sessionId=123`
    expect(buildContentFromSessions(sessions, "flow", "team")).toEqual(result);
  });

});

describe("Resume Application endpoint", () => {
  it("throws an error if an email is not provided", async () => {
    await supertest(app)
      .post(ENDPOINT)
      .send({ flowId: "test"})
      .expect(400)
      .then(response => {
        expect(response.body).toHaveProperty("error", "Required value missing");
    });
  });

  it("throws an error if a flowId is not provided", async () => {
    await supertest(app)
      .post(ENDPOINT)
      .send({ email: "test@test.xyz"})
      .expect(400)
      .then(response => {
        expect(response.body).toHaveProperty("error", "Required value missing");
    });
  });

  it("throws an error if a flowId is invalid", async () => {
    const flowId = 123;

    queryMock.mockQuery({
      name: 'GetFlowByPK',
      data: { flows_by_pk: null },
      variables: { flowId: flowId }
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
      name: 'GetFlowByPK',
      data: {
        flows_by_pk: { slug: "slug", team: {
          slug: "teamName",
          notifyPersonalisation: {
            helpPhone: "test",
            helpEmail: "test",
            helpOpeningHours: "test",
          }
        }
      },
    },
      variables: {
        flowId: flowId,
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

  it.todo("throws an error if there is not a matching session");
});