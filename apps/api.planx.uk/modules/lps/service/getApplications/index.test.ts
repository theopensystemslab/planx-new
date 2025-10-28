import supertest from "supertest";
import app from "../../../../server.js";
import { queryMock } from "../../../../tests/graphqlQueryMock.js";
import { v4 as uuidV4 } from "uuid";
import { NOTIFY_TEST_EMAIL } from "../../../../lib/notify/utils.js";
import * as getApplicationsService from "./index.js";
import type { Application } from "./types.js";

describe("fetching applications - validation", () => {
  const ENDPOINT = "/lps/applications";

  describe("payload validation", () => {
    it("requires an email address", async () => {
      await supertest(app)
        .post(ENDPOINT)
        .send({ token: uuidV4() })
        .expect(400)
        .then((res) => {
          expect(res.body).toHaveProperty("issues");
          expect(res.body).toHaveProperty("name", "ZodError");
        });
    });

    it("requires a token", async () => {
      await supertest(app)
        .post(ENDPOINT)
        .send({ email: NOTIFY_TEST_EMAIL })
        .expect(400)
        .then((res) => {
          expect(res.body).toHaveProperty("issues");
          expect(res.body).toHaveProperty("name", "ZodError");
        });
    });
  });

  describe("magic link validation", () => {
    test("invalid token", async () => {
      queryMock.mockQuery({
        name: "GetMagicLinkStatus",
        matchOnVariables: false,
        data: {
          // No matching token found
          magicLink: null,
        },
      });

      await supertest(app)
        .post(ENDPOINT)
        .send({ token: uuidV4(), email: NOTIFY_TEST_EMAIL })
        .expect(404)
        .then((res) => {
          expect(res.body.error).toMatch(/LINK_INVALID/);
        });
    });

    test("expired token", async () => {
      queryMock.mockQuery({
        name: "GetMagicLinkStatus",
        matchOnVariables: false,
        data: {
          magicLink: {
            // Link created a long time ago
            usedAt: null,
            createdAt: new Date("1970-1-1").toString(),
          },
        },
      });

      await supertest(app)
        .post(ENDPOINT)
        .send({ token: uuidV4(), email: NOTIFY_TEST_EMAIL })
        .expect(410)
        .then((res) => {
          expect(res.body.error).toMatch(/LINK_EXPIRED/);
        });
    });

    test("consumed token", async () => {
      queryMock.mockQuery({
        name: "GetMagicLinkStatus",
        matchOnVariables: false,
        data: {
          magicLink: {
            // Link consumed a long time ago
            usedAt: new Date("1970-2-2").toString(),
            createdAt: new Date("1970-1-1").toString(),
          },
        },
      });

      await supertest(app)
        .post(ENDPOINT)
        .send({ token: uuidV4(), email: NOTIFY_TEST_EMAIL })
        .expect(410)
        .then((res) => {
          expect(res.body.error).toMatch(/LINK_CONSUMED/);
        });
    });

    it("handles errors", async () => {
      queryMock.mockQuery({
        name: "GetMagicLinkStatus",
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
        .send({ token: uuidV4(), email: NOTIFY_TEST_EMAIL })
        .expect(500)
        .then((res) => {
          expect(res.body.error).toMatch(/Failed to validate LPS magic link/);
        });
    });
  });
});

describe("fetching applications", () => {
  const ENDPOINT = "/lps/applications";

  const mockLowcalSession: Omit<Application, "id" | "status"> = {
    createdAt: "createdAtTime",
    addressLine: null,
    addressTitle: null,
    updatedAt: "updatedAtTime",
    service: {
      name: "Service Name",
      slug: "service-slug",
      team: {
        name: "Team Name",
        slug: "team-slug",
        domain: null,
      },
    },
  };

  beforeEach(() => {
    queryMock.mockQuery({
      name: "GetMagicLinkStatus",
      matchOnVariables: false,
      data: {
        magicLink: {
          usedAt: null,
          createdAt: Date.now().toString(),
        },
      },
    });

    queryMock.mockQuery({
      name: "ConsumeMagicLinkToken",
      matchOnVariables: false,
      data: {
        updateMagicLinks: {
          returning: [
            {
              applications: [
                {
                  ...mockLowcalSession,
                  status: "draft",
                  id: "1",
                  addressLine: "1, Bag End, The Shire, Eriador",
                  addressTitle: null,
                },
                {
                  ...mockLowcalSession,
                  status: "draft",
                  id: "2",
                  addressLine: null,
                  addressTitle: "Bag End",
                },
                {
                  ...mockLowcalSession,
                  status: "submitted",
                  id: "3",
                  submittedAt: "submittedAtTime",
                },
              ],
            },
          ],
        },
      },
    });
  });

  // Functional test coverage added via E2E tests
  // File: e2e/tests/api-driven/src/lps/getApplications.feature
  describe("fetching applications", () => {
    const token = uuidV4();

    it("returns an empty list if no applications are found", async () => {
      queryMock.mockQuery({
        name: "ConsumeMagicLinkToken",
        matchOnVariables: false,
        data: {
          updateMagicLinks: {
            returning: [],
          },
        },
      });

      await supertest(app)
        .post(ENDPOINT)
        .send({ token, email: NOTIFY_TEST_EMAIL })
        .expect(200)
        .then((res) => {
          expect(res.body).toHaveLength(0);
        });
    });

    it("returns formatted applications", async () => {
      await supertest(app)
        .post(ENDPOINT)
        .send({ token, email: NOTIFY_TEST_EMAIL })
        .expect(200)
        .then((res) => {
          expect(res.body).toHaveLength(3);

          expect(res.body[0]).toMatchObject({
            id: "1",
            status: "draft",
            createdAt: "createdAtTime",
            service: {
              name: "Service Name",
            },
            team: {
              name: "Team Name",
            },
            serviceUrl:
              "https://www.example.com/team-slug/service-slug/published?sessionId=1&email=simulate-delivered%40notifications.service.gov.uk",
          });
          expect(res.body[2]).toMatchObject({
            id: "3",
            status: "submitted",
            address: null,
            createdAt: "createdAtTime",
            submittedAt: "submittedAtTime",
            service: {
              name: "Service Name",
            },
            team: {
              name: "Team Name",
            },
          });
        });
    });

    it("formats addresses, where available", async () => {
      await supertest(app)
        .post(ENDPOINT)
        .send({ token, email: NOTIFY_TEST_EMAIL })
        .expect(200)
        .then((res) => {
          // Prefers single line address
          expect(res.body[0].address).toBe("1, Bag End, The Shire, Eriador");

          // Falls back to title
          expect(res.body[1].address).toBe("Bag End");

          // Will return null if no address available
          expect(res.body[2].address).toBeNull();
        });
    });
  });

  it("handles GraphQL errors", async () => {
    const testToken = uuidV4();

    queryMock.mockQuery({
      name: "ConsumeMagicLinkToken",
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
      .send({ email: NOTIFY_TEST_EMAIL, token: testToken })
      .expect(500)
      .then((res) => {
        expect(res.body.error).toMatch(
          /Failed to fetch LPS applications for token/,
        );
        expect(res.body.error).toContain(testToken);
      });
  });

  it("handles uncaught errors", async () => {
    const testToken = uuidV4();

    vi.spyOn(getApplicationsService, "getApplications").mockRejectedValueOnce(
      new Error("Unhandled error!"),
    );

    await supertest(app)
      .post(ENDPOINT)
      .send({ email: NOTIFY_TEST_EMAIL, token: testToken })
      .expect(500)
      .then((res) => {
        expect(res.body.error).toMatch(
          /Failed to fetch LPS applications for token/,
        );
        expect(res.body.error).toContain(testToken);
        expect(res.body.error).toMatch(/Unhandled error!/);
      });
  });
});
