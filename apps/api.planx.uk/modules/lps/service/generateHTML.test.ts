import supertest from "supertest";
import app from "../../../server.js";
import { queryMock } from "../../../tests/graphqlQueryMock.js";
import { v4 as uuidV4 } from "uuid";
import { NOTIFY_TEST_EMAIL } from "../../../lib/notify/utils.js";
import * as validateDownloadTokenMiddleware from "./../middleware/validateDownloadToken.js";
import * as generateHTMLService from "./generateHTML.js";
import type * as planxCore from "@opensystemslab/planx-core";
import { expectedPlanningPermissionPayload } from "../../../tests/mocks/digitalPlanningDataMocks.js";

const mockGenerateHTMLData = vi
  .fn()
  .mockResolvedValue(expectedPlanningPermissionPayload);

vi.mock("@opensystemslab/planx-core", async (importOriginal) => {
  const originalModule = await importOriginal<typeof planxCore>();

  return {
    ...originalModule,
    CoreDomainClient: class extends originalModule.CoreDomainClient {
      constructor() {
        super();
        this.export.digitalPlanningDataPayload = () => mockGenerateHTMLData();
      }
    },
  };
});

describe("requesting HTML for a session ID", () => {
  const ENDPOINT = "/lps/download/HTML";

  describe("payload validation", () => {
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

    it("requires an auth header", async () => {
      await supertest(app)
        .post(ENDPOINT)
        .set({ some: "otherHeaders" })
        .expect(400)
        .then((res) => {
          expect(res.body).toHaveProperty("issues");
          expect(res.body).toHaveProperty("name", "ZodError");
          expect(res.body.issues[0].message).toMatch(
            /Authorization headers are required/,
          );
        });
    });

    it("requires an auth header in the correct format", async () => {
      await supertest(app)
        .post(ENDPOINT)
        .set({ authorization: "abc123" })
        .expect(400)
        .then((res) => {
          console.log(res.body);
          expect(res.body).toHaveProperty("issues");
          expect(res.body).toHaveProperty("name", "ZodError");
          expect(res.body.issues[0].message).toMatch(/Invalid token format/);
        });
    });
  });

  describe("download token validation", () => {
    test("invalid token", async () => {
      queryMock.mockQuery({
        name: "GetDownloadTokenStatus",
        matchOnVariables: false,
        data: {
          // No matching download token found
          downloadToken: [],
        },
      });

      await supertest(app)
        .post(ENDPOINT)
        .set({ authorization: `Bearer ${uuidV4()}` })
        .send({ sessionId: uuidV4(), email: NOTIFY_TEST_EMAIL })
        .expect(404)
        .then((res) => {
          expect(res.body.error).toMatch(/DOWNLOAD_TOKEN_INVALID/);
        });
    });

    test("expired token", async () => {
      queryMock.mockQuery({
        name: "GetDownloadTokenStatus",
        matchOnVariables: false,
        data: {
          downloadToken: [
            {
              // Link created a long time ago
              usedAt: null,
              createdAt: new Date("1970-1-1").toString(),
            },
          ],
        },
      });

      await supertest(app)
        .post(ENDPOINT)
        .set({ authorization: `Bearer ${uuidV4()}` })
        .send({ sessionId: uuidV4(), email: NOTIFY_TEST_EMAIL })
        .expect(410)
        .then((res) => {
          expect(res.body.error).toMatch(/DOWNLOAD_TOKEN_EXPIRED/);
        });
    });

    test("consumed token", async () => {
      queryMock.mockQuery({
        name: "GetDownloadTokenStatus",
        matchOnVariables: false,
        data: {
          downloadToken: [
            {
              // Link consumed a long time ago
              usedAt: new Date("1970-2-2").toString(),
              createdAt: new Date("1970-1-1").toString(),
            },
          ],
        },
      });

      await supertest(app)
        .post(ENDPOINT)
        .set({ authorization: `Bearer ${uuidV4()}` })
        .send({ sessionId: uuidV4(), email: NOTIFY_TEST_EMAIL })
        .expect(410)
        .then((res) => {
          expect(res.body.error).toMatch(/DOWNLOAD_TOKEN_CONSUMED/);
        });
    });

    it("handles errors", async () => {
      queryMock.mockQuery({
        name: "GetDownloadTokenStatus",
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
        .set({ authorization: `Bearer ${uuidV4()}` })
        .send({ sessionId: uuidV4(), email: NOTIFY_TEST_EMAIL })
        .expect(500)
        .then((res) => {
          expect(res.body.error).toMatch(/Failed to validate download token/);
        });
    });
  });

  describe("download token consumption", () => {
    beforeEach(() => {
      // Successfully validate token
      queryMock.mockQuery({
        name: "GetDownloadTokenStatus",
        matchOnVariables: false,
        data: {
          downloadToken: [
            {
              usedAt: null,
              createdAt: Date.now().toString(),
            },
          ],
        },
      });
    });

    it("handles GraphQL errors", async () => {
      queryMock.mockQuery({
        name: "ConsumeDownloadToken",
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
        .set({ authorization: `Bearer ${uuidV4()}` })
        .send({ sessionId: uuidV4(), email: NOTIFY_TEST_EMAIL })
        .expect(500)
        .then((res) => {
          expect(res.body.error).toMatch(/Failed to consume download token/);
        });
    });

    it("handles uncaught errors", async () => {
      vi.spyOn(
        validateDownloadTokenMiddleware,
        "consumeDownloadToken",
      ).mockRejectedValueOnce(new Error("Unhandled error!"));

      await supertest(app)
        .post(ENDPOINT)
        .set({ authorization: `Bearer ${uuidV4()}` })
        .send({ sessionId: uuidV4(), email: NOTIFY_TEST_EMAIL })
        .expect(500)
        .then((res) => {
          expect(res.body.error).toMatch(/Failed to consume download token/);
        });
    });
  });

  describe("downloading HTML", async () => {
    beforeEach(() => {
      // Successfully validate token
      queryMock.mockQuery({
        name: "GetDownloadTokenStatus",
        matchOnVariables: false,
        data: {
          downloadToken: [
            {
              usedAt: null,
              createdAt: Date.now().toString(),
            },
          ],
        },
      });

      // Consume token
      queryMock.mockQuery({
        name: "ConsumeDownloadToken",
        matchOnVariables: false,
        data: {
          token: uuidV4(),
        },
      });

      // Get session details
      queryMock.mockQuery({
        name: "GetSessionById",
        matchOnVariables: false,
        data: {
          session: {
            id: "56841432-b654-4d64-ab54-5d23d007a034",
            data: {
              id: "cc1a89cb-c552-4a52-a3b5-5a32ecadf18e",
              passport: {},
              sessionId: "56841432-b654-4d64-ab54-5d23d007a034",
              breadcrumbs: {},
            },
            flow: {
              id: "cc1a89cb-c552-4a52-a3b5-5a32ecadf18e",
              slug: "request-a-building-control-quote",
              name: "Request a building control quote",
            },
          },
        },
      });
    });

    it("handles uncaught errors", async () => {
      vi.spyOn(generateHTMLService, "generateHTML").mockRejectedValueOnce(
        new Error("Unhandled error!"),
      );

      await supertest(app)
        .post(ENDPOINT)
        .set({ authorization: `Bearer ${uuidV4()}` })
        .send({ sessionId: uuidV4(), email: NOTIFY_TEST_EMAIL })
        .expect(500)
        .then((res) => {
          expect(res.body.error).toMatch(/Failed to generate HTML for session/);
          expect(res.body.error).toMatch(/Unhandled error!/);
        });
    });

    it("successfully downloads HTML when valid detail are provided", async () => {
      await supertest(app)
        .post(ENDPOINT)
        .set({ authorization: `Bearer ${uuidV4()}` })
        .send({ sessionId: uuidV4(), email: NOTIFY_TEST_EMAIL })
        .expect(200)
        .then((res) => {
          // Token has been consumed
          const graphQLCalls = queryMock.getCalls();
          expect(graphQLCalls).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                id: "ConsumeDownloadToken",
              }),
            ]),
          );

          // HTML response returned
          expect(res.headers["content-type"]).toMatch(/text\/html/);
          expect(res).toHaveProperty("text");

          // Expected HTML document
          expect(res.text).toMatch(/^<html>.*<\/html>$/s);
          expect(res.text).toMatch(/Planning Permission/);
        });
    });
  });
});
