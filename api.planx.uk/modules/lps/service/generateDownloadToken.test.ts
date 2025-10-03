import supertest from "supertest";
import app from "../../../server.js";
import { queryMock } from "../../../tests/graphqlQueryMock.js";
import { v4 as uuidV4 } from "uuid";
import { NOTIFY_TEST_EMAIL } from "../../../lib/notify/utils.js";
import * as generateDownloadTokenService from "./generateDownloadToken.js";

describe("generating a download token", () => {
  const ENDPOINT = "/lps/download/token";

  it("requires an email address", async () => {
    await supertest(app)
      .post(ENDPOINT)
      .send({ sessionId: uuidV4() })
      .expect(400)
      .then((res) => {
        expect(res.body).toHaveProperty("issues");
        expect(res.body).toHaveProperty("name", "ZodError");
      });
  });

  it("requires a sessionId", async () => {
    await supertest(app)
      .post(ENDPOINT)
      .send({ email: NOTIFY_TEST_EMAIL })
      .expect(400)
      .then((res) => {
        expect(res.body).toHaveProperty("issues");
        expect(res.body).toHaveProperty("name", "ZodError");
      });
  });

  it("requires a valid sessionId", async () => {
    queryMock.mockQuery({
      name: "CheckDownloadableSessionExists",
      matchOnVariables: false,
      // Mock no results found
      data: { lowcalSessions: [] },
    });

    await supertest(app)
      .post(ENDPOINT)
      .send({ email: NOTIFY_TEST_EMAIL, sessionId: uuidV4() })
      .expect(403)
      .then((res) => {
        expect(res.body.error).toMatch(/Unauthorised/);
      });
  });

  it("handles GraphQL errors", async () => {
    queryMock.mockQuery({
      name: "CheckDownloadableSessionExists",
      matchOnVariables: false,
      data: { lowcalSessions: [{ sessionId: uuidV4() }] },
    });

    queryMock.mockQuery({
      name: "CreateLPSDownloadToken",
      matchOnVariables: false,
      data: {},
      graphqlErrors: [
        {
          message: "Something went wrong",
        },
      ],
    });

    await supertest(app)
      .post(ENDPOINT)
      .send({ email: NOTIFY_TEST_EMAIL, sessionId: uuidV4() })
      .expect(500)
      .then((res) => {
        expect(res.body.error).toMatch(/Failed to generate download token/);
      });
  });

  it("handles uncaught errors", async () => {
    queryMock.mockQuery({
      name: "CheckDownloadableSessionExists",
      matchOnVariables: false,
      data: { lowcalSessions: [{ sessionId: uuidV4() }] },
    });

    vi.spyOn(
      generateDownloadTokenService,
      "generateDownloadToken",
    ).mockRejectedValueOnce(new Error("Unhandled error!"));

    await supertest(app)
      .post(ENDPOINT)
      .send({ email: NOTIFY_TEST_EMAIL, sessionId: uuidV4() })
      .expect(500)
      .then((res) => {
        expect(res.body.error).toMatch(/Failed to generate download token/);
        expect(res.body.error).toMatch(/Unhandled error!/);
      });
  });

  it("returns a token on success", async () => {
    queryMock.mockQuery({
      name: "CheckDownloadableSessionExists",
      matchOnVariables: false,
      data: { lowcalSessions: [{ sessionId: uuidV4() }] },
    });

    const testToken = uuidV4();

    queryMock.mockQuery({
      name: "CreateLPSDownloadToken",
      matchOnVariables: false,
      data: {
        download: {
          token: testToken,
        },
      },
    });

    await supertest(app)
      .post(ENDPOINT)
      .send({ email: NOTIFY_TEST_EMAIL, sessionId: uuidV4() })
      .expect(200)
      .then((res) => {
        expect(res.body).toHaveProperty("token", testToken);
      });
  });
});
