const supertest = require("supertest");
const app = require("../server");
// const { queryMock } = require("../tests/graphqlQueryMock");
// const { mockFlow, mockLowcalSession } = require("../tests/mocks/saveAndReturnMocks");

// https://docs.notifications.service.gov.uk/node.html#email-addresses
// const TEST_EMAIL = "simulate-delivered@notifications.service.gov.uk"
const ENDPOINT = "/validate-session";

describe("Validate Session endpoint", () => {

  it("throws an error if required data is missing", async () => {
    const missingEmail = { sessionId: 123 };
    const missingSessionId = { email: "test" };

    for (let invalidBody of [missingEmail, missingSessionId]) {
      await supertest(app)
      .post(ENDPOINT)
      .send(invalidBody)
      .expect(400)
      .then(response => {
        expect(response.body).toHaveProperty("error", "Required value missing");
      });
    };
  });

  it.todo("Returns a 200 OK for a valid session");
  it.todo("Returns a 404 NOT FOUND for an invalid session");
});