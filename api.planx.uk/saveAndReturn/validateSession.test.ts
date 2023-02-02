import supertest from "supertest";
import app from "../server";

const ENDPOINT = "/validate-session";

describe("Validate Session endpoint", () => {
  it("throws an error if required data is missing", async () => {
    const missingEmail = { payload: { sessionId: 123 } };
    const missingSessionId = { payload: { email: "test" } };

    for (const invalidBody of [missingEmail, missingSessionId]) {
      await supertest(app)
        .post(ENDPOINT)
        .send(invalidBody)
        .expect(400)
        .then((response) => {
          expect(response.body).toHaveProperty(
            "error",
            "Required value missing"
          );
        });
    }
  });

  it.todo("Returns a 200 OK for a valid session");
  it.todo("Returns a 404 NOT FOUND for an invalid session");
});
