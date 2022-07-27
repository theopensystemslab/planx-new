const supertest = require("supertest");
const app = require("../server");
const { queryMock } = require("../tests/graphqlQueryMock");
const { mockLowcalSession, mockTeam } = require("../tests/mocks/saveAndReturnMocks");
const { buildContentFromSessions } = require("./resumeApplication");

const ENDPOINT = "/resume-application";
const TEST_EMAIL = "simulate-delivered@notifications.service.gov.uk"

describe("buildContentFromSessions function", () => {

  beforeEach(() => {
    queryMock.reset();
    queryMock.mockQuery({
      name: "GetHumanReadableProjectType",
      data: {
        project_types: [
          { description: "New office premises" }
        ],
      },
      variables: {
        rawList: ["new.office"],
      }
    });
  });

  it("should return correctly formatted content for a single session", async () => {
    const sessions = [{
      data: {
        passport: {
          data: {
            _address: {
              single_line_address: "1 High Street"
            },
            "proposal.projectType": ["new.office"]
          }
        }
      },
      id: 123,
      created_at: "2022-05-01T01:02:03.865452+00:00",
      flow: {
        slug: "apply-for-a-lawful-development-certificate"
      },
    }];

    const result = `Service: Apply For A Lawful Development Certificate
      Address: 1 High Street
      Project type: New office premises
      Expiry Date: 29 May 2022
      Link: example.com/team/apply-for-a-lawful-development-certificate/preview?sessionId=123`
    expect(await buildContentFromSessions(sessions, "team")).toEqual(result);
  });

  it("should return correctly formatted content for multiple session", async () => {
    const sessions = [{
      data: {
        passport: {
          data: {
            _address: {
              single_line_address: "1 High Street"
            },
            "proposal.projectType": ["new.office"]
          }
        }
      },
      id: 123,
      created_at: "2022-05-01T01:02:03.865452+00:00",
      flow: {
        slug: "apply-for-a-lawful-development-certificate"
      },
    },
    {
      data: {
        passport: {
          data: {
            _address: {
              single_line_address: "2 High Street"
            },
            "proposal.projectType": ["new.office"]
          }
        }
      },
      id: 456,
      created_at: "2022-05-01T01:02:03.865452+00:00",
      flow: {
        slug: "apply-for-a-lawful-development-certificate"
      },
    },
    {
      data: {
        passport: {
          data: {
            _address: {
              single_line_address: "3 High Street"
            },
            "proposal.projectType": ["new.office"]
          }
        }
      },
      id: 789,
      created_at: "2022-05-01T01:02:03.865452+00:00",
      flow: {
        slug: "apply-for-a-lawful-development-certificate"
      },
    }];
    const result = `Service: Apply For A Lawful Development Certificate
      Address: 1 High Street
      Project type: New office premises
      Expiry Date: 29 May 2022
      Link: example.com/team/apply-for-a-lawful-development-certificate/preview?sessionId=123\n\nService: Apply For A Lawful Development Certificate
      Address: 2 High Street
      Project type: New office premises
      Expiry Date: 29 May 2022
      Link: example.com/team/apply-for-a-lawful-development-certificate/preview?sessionId=456\n\nService: Apply For A Lawful Development Certificate
      Address: 3 High Street
      Project type: New office premises
      Expiry Date: 29 May 2022
      Link: example.com/team/apply-for-a-lawful-development-certificate/preview?sessionId=789`
    expect(await buildContentFromSessions(sessions, "team")).toEqual(result)
  });

  it("should handle an empty address field", async () => {
    const sessions = [{
      data: {
        passport: {
          // Missing address
          data: {
            "proposal.projectType": ["new.office"]
          }
        }
      },
      id: 123,
      created_at: "2022-05-01T01:02:03.865452+00:00",
      flow: {
        slug: "apply-for-a-lawful-development-certificate"
      },
    }];

    const result = `Service: Apply For A Lawful Development Certificate
      Address: Address not submitted
      Project type: New office premises
      Expiry Date: 29 May 2022
      Link: example.com/team/apply-for-a-lawful-development-certificate/preview?sessionId=123`
    expect(await buildContentFromSessions(sessions, "team")).toEqual(result);
  });

  it("should handle an empty project type field", async () => {
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
      created_at: "2022-05-01T01:02:03.865452+00:00",
      flow: {
        slug: "apply-for-a-lawful-development-certificate"
      },
    }];

    const result = `Service: Apply For A Lawful Development Certificate
      Address: 1 High Street
      Project type: Project type not submitted
      Expiry Date: 29 May 2022
      Link: example.com/team/apply-for-a-lawful-development-certificate/preview?sessionId=123`
    expect(await buildContentFromSessions(sessions, "team")).toEqual(result);
  });

});

describe("Resume Application endpoint", () => {

  beforeEach(() => {
    queryMock.reset();
    queryMock.mockQuery({
      name: "GetHumanReadableProjectType",
      data: {
        project_types: [
          { description: "New office premises" }
        ],
      },
      variables: {
        rawList: ["new.office"],
      }
    });
  });

  it("throws an error for if required data is missing", async () => {

    const missingEmail = { payload: { teamSlug: "test" } };
    const missingTeamSlug = { payload: { email: "test" } };

    for (let invalidBody of [missingEmail, missingTeamSlug]) {
      await supertest(app)
        .post(ENDPOINT)
        .send(invalidBody)
        .expect(400)
        .then(response => {
          expect(response.body).toHaveProperty("error", "Required value missing");
        });
    };
  });

  it("throws an error if a teamSlug is invalid", async () => {
    const body = { payload: { teamSlug: "not-a-team", email: TEST_EMAIL } };

    queryMock.mockQuery({
      name: 'ValidateRequest',
      data: { teams: null, lowcal_sessions: null },
      variables: payload
    });

    await supertest(app)
      .post(ENDPOINT)
      .send(body)
      .expect(500)
      .then(response => {
        expect(response.body).toHaveProperty('error', 'Failed to send "Resume" email. Unable to validate request');
      });
  });

  it("sends a Notify email on successful resume", async () => {
    const body = { payload: { teamSlug: "test-team", email: TEST_EMAIL } };

    queryMock.mockQuery({
      name: 'ValidateRequest',
      data: {
        lowcal_sessions: [mockLowcalSession],
        teams: [mockTeam]
      },
      variables: body.payload
    });

    await supertest(app)
      .post(ENDPOINT)
      .send(body)
      .expect(200)
      .then(response => {
        expect(response.body).toHaveProperty("message", "Success");
      });
  });

  it("give a successful response even if there is not a matching session", async () => {
    const body = { payload: { teamSlug: "test-team", email: TEST_EMAIL } };

    queryMock.mockQuery({
      name: 'ValidateRequest',
      data: { teams: [mockTeam], lowcal_sessions: [] },
      variables: body.payload
    });

    await supertest(app)
      .post(ENDPOINT)
      .send(body)
      .expect(200)
      .then(response => {
        expect(response.body).toHaveProperty("message", "Success");
      });
  });
});