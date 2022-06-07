const supertest = require("supertest");
const app = require("../server");
const { queryMock } = require("../tests/graphqlQueryMock");
const { mockLowcalSession, mockTeam } = require("../tests/mocks/saveAndReturnMocks");
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
            "proposal.projectType": ["house"]
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
      Project Type: house
      Expiry Date: 29 May 2022
      Link: example.com/team/apply-for-a-lawful-development-certificate/preview?sessionId=123`
    expect(buildContentFromSessions(sessions, "team")).toEqual(result);
  });

  it("should return correctly formatted content for multiple session", () => {
    const sessions = [{
      data: {
        passport: {
          data: {
            _address: {
              single_line_address: "1 High Street"
            },
            "proposal.projectType": ["house"]
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
            "proposal.projectType": ["flat"]
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
            "proposal.projectType": ["farm"]
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
      Project Type: house
      Expiry Date: 29 May 2022
      Link: example.com/team/apply-for-a-lawful-development-certificate/preview?sessionId=123\n\nService: Apply For A Lawful Development Certificate
      Address: 2 High Street
      Project Type: flat
      Expiry Date: 29 May 2022
      Link: example.com/team/apply-for-a-lawful-development-certificate/preview?sessionId=456\n\nService: Apply For A Lawful Development Certificate
      Address: 3 High Street
      Project Type: farm
      Expiry Date: 29 May 2022
      Link: example.com/team/apply-for-a-lawful-development-certificate/preview?sessionId=789`
    expect(buildContentFromSessions(sessions, "team")).toEqual(result)
  });

  it("should handle an empty address field", () => {
    const sessions = [{
      data: {
        passport: {
          // Missing address
          data: {
            "proposal.projectType": ["house"]
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
      Project Type: house
      Expiry Date: 29 May 2022
      Link: example.com/team/apply-for-a-lawful-development-certificate/preview?sessionId=123`
    expect(buildContentFromSessions(sessions, "team")).toEqual(result);
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
      created_at: "2022-05-01T01:02:03.865452+00:00",
      flow: {
        slug: "apply-for-a-lawful-development-certificate"
      },
    }];

    const result = `Service: Apply For A Lawful Development Certificate
      Address: 1 High Street
      Project Type: Project type not submitted
      Expiry Date: 29 May 2022
      Link: example.com/team/apply-for-a-lawful-development-certificate/preview?sessionId=123`
    expect(buildContentFromSessions(sessions, "team")).toEqual(result);
  });

});

describe("Resume Application endpoint", () => {

  it("throws an error for if required data is missing", () => {

    const missingEmail = { teamSlug: "test" };
    const missingTeamSlug = { email: "test" };

    [missingEmail, missingTeamSlug].forEach(async (invalidBody) => {
      await supertest(app)
      .post(ENDPOINT)
      .send(invalidBody)
      .expect(400)
      .then(response => {
        expect(response.body).toHaveProperty("error", "Required value missing");
      });
    })
  });

  it("throws an error if a teamSlug is invalid", async () => {
    const payload = { teamSlug: "not-a-team", email: TEST_EMAIL };

    queryMock.mockQuery({
      name: 'ValidateRequest',
      data: { teams: null, lowcal_sessions: null },
      variables: payload
    });

    await supertest(app)
      .post(ENDPOINT)
      .send(payload)
      .expect(500)
      .then(response => {
        expect(response.body).toHaveProperty("error", "Unable to validate request");
    });
  });
  
  it("sends a Notify email on successful resume", async () => {
    const payload = { teamSlug: "test-team", email: TEST_EMAIL };

    queryMock.mockQuery({
      name: 'ValidateRequest',
      data: {
        lowcal_sessions: [mockLowcalSession],
        teams: [mockTeam]
      },
      variables: payload
    });

    await supertest(app)
      .post(ENDPOINT)
      .send(payload)
      .expect(200)
  });

  it("give a successful response even if there is not a matching session", async () => {
    const payload = { teamSlug: "test-team", email: TEST_EMAIL };

    queryMock.mockQuery({
      name: 'ValidateRequest',
      data: { teams: [mockTeam], lowcal_sessions: null },
      variables: payload
    });

    await supertest(app)
      .post(ENDPOINT)
      .send(payload)
      .expect(200);
  });
});