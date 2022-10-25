import supertest from "supertest";
import app from "../server";

const ENDPOINT = "/validate-session";

describe("Validate Session endpoint", () => {

  it("throws an error if required data is missing", (done) => {
    const missingEmail = { payload: { sessionId: 123 } };
    const missingSessionId = { payload: { email: "test" } };

    for (let invalidBody of [missingEmail, missingSessionId]) {
      supertest(app)
        .post(ENDPOINT)
        .send(invalidBody)
        .expect(400)
        .then(response => {
          expect(response.body).toHaveProperty("error", "Required value missing");
          done();
        })
        .catch(done);
    }
  });

  it.todo("Returns a 200 OK for a valid session");
  it.todo("Returns a 404 NOT FOUND for an invalid session");
});