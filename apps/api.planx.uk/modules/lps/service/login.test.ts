import supertest from "supertest";
import app from "../../../server.js";
import { queryMock } from "../../../tests/graphqlQueryMock.js";
import { v4 as uuidV4 } from "uuid";
import { NOTIFY_TEST_EMAIL } from "../../../lib/notify/utils.js";
import { sendEmail } from "../../../lib/notify/index.js";
import * as loginService from "./login.js";

vi.mock("../../../lib/notify/index.js", () => ({
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
