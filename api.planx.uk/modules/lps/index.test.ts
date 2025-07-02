import supertest from "supertest";
import app from "../../server.js";
import { queryMock } from "../../tests/graphqlQueryMock.js";
import { v4 as uuidV4 } from "uuid";
import { NOTIFY_TEST_EMAIL } from "../../lib/notify/utils.js";
import { sendEmail } from "../../lib/notify/index.js";
import type { RawApplication } from "./service/getApplications.js";
import * as getApplicationsService from "./service/getApplications.js";
import * as loginService from "./service/login.js";

vi.mock("../../lib/notify/index.js", () => ({
  sendEmail: vi.fn(),
}));

afterEach(() => {
  queryMock.reset();
  vi.restoreAllMocks();
});

describe("logging into LPS applications", () => {
  const ENDPOINT = "/lps/login";

  describe("validation", () => {
    it("requires an email address", async () => {
      await supertest(app)
        .post(ENDPOINT)
        .expect(400)
        .then((res) => {
          expect(res.body).toHaveProperty("issues");
          expect(res.body).toHaveProperty("name", "ZodError");
        });
    });
  });

  it("send an email using the 'lps-login' template with a magic link", async () => {
    const testToken = uuidV4();

    queryMock.mockQuery({
      name: "CreateLPSLoginToken",
      matchOnVariables: false,
      data: {
        magicLink: {
          token: testToken,
        },
      },
    });

    await supertest(app)
      .post(ENDPOINT)
      .send({ email: NOTIFY_TEST_EMAIL })
      .expect(200)
      .then((res) => {
        expect(res.body).toHaveProperty("message", "success");

        expect(sendEmail).toHaveBeenCalledWith(
          "lps-login",
          NOTIFY_TEST_EMAIL,
          expect.objectContaining({
            personalisation: expect.objectContaining({
              magicLink: `https://www.localplanning.services/applications?token=${testToken}&email=${encodeURIComponent(NOTIFY_TEST_EMAIL)}`,
            }),
          }),
        );
      });
  });

  it("handles GraphQL errors", async () => {
    queryMock.mockQuery({
      name: "CreateLPSLoginToken",
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
      .send({ email: NOTIFY_TEST_EMAIL })
      .expect(500)
      .then((res) => {
        expect(res.body.error).toMatch(/Failed to send "lps-login" email/);
      });
  });

  it("handles uncaught errors", async () => {
    vi.spyOn(loginService, "login").mockRejectedValueOnce(
      new Error("Unhandled error!"),
    );

    await supertest(app)
      .post(ENDPOINT)
      .send({ email: NOTIFY_TEST_EMAIL })
      .expect(500)
      .then((res) => {
        expect(res.body.error).toMatch(/Failed to send "lps-login" email/);
        expect(res.body.error).toMatch(/Unhandled error!/);
      });
  });
});

describe("fetching applications", () => {
  const mockLowcalSession: Omit<RawApplication, "id"> = {
    updatedAt: "updatedAtTime",
    submittedAt: "submittedAtTime",
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
      name: "ConsumeMagicLinkToken",
      matchOnVariables: false,
      data: {
        updateMagicLinks: {
          returning: [
            {
              applications: [
                { id: "1", ...mockLowcalSession },
                { id: "2", ...mockLowcalSession },
                { id: "3", ...mockLowcalSession },
              ],
            },
          ],
        },
      },
    });
  });

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
          expect(res.body.applications).toHaveLength(0);
        });
    });

    it("returns formatted applications", async () => {
      await supertest(app)
        .post(ENDPOINT)
        .send({ token, email: NOTIFY_TEST_EMAIL })
        .expect(200)
        .then((res) => {
          expect(res.body.applications).toHaveLength(3);
          expect(res.body.applications[0]).toMatchObject({
            id: "1",
            updatedAt: "updatedAtTime",
            submittedAt: "submittedAtTime",
            service: {
              name: "Service Name",
              slug: "service-slug",
            },
            team: {
              name: "Team Name",
              slug: "team-slug",
              domain: null,
            },
            url: "https://www.example.com/team-slug/service-slug/published?sessionId=1",
          });
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
