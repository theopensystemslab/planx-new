import supertest from "supertest";
import app from "../../../../server.js";
import SlackNotify from "slack-notify";

const mockSend = vi.fn();
vi.mock("slack-notify", () => ({
  default: vi.fn().mockImplementation(() => {
    return { send: mockSend };
  }),
}));

const { post } = supertest(app);

describe("Generic send Slack message endpoint", () => {
  const ENDPOINT = "/webhooks/hasura/send-slack-message";
  const ORIGINAL_ENV = process.env;

  const validBody = {
    channel: "#planx-notifications-internal",
    message: ":tada: New team created: example-council",
  };

  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
    mockSend.mockResolvedValue("Success!");
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  describe("authentication and validation", () => {
    it("fails without correct authentication", async () => {
      await post(ENDPOINT)
        .send(validBody)
        .expect(401)
        .then((response) => {
          expect(response.body).toEqual({ error: "Unauthorised" });
        });
    });

    it("returns a 400 if 'message' is missing", async () => {
      await post(ENDPOINT)
        .set({ Authorization: process.env.HASURA_PLANX_API_KEY! })
        .send({ channel: "#planx-notifications-internal" })
        .expect(400)
        .then((response) => {
          expect(response.body).toHaveProperty("issues");
          expect(response.body).toHaveProperty("name", "ZodError");
        });
    });

    it("returns a 400 if 'channel' is missing", async () => {
      await post(ENDPOINT)
        .set({ Authorization: process.env.HASURA_PLANX_API_KEY! })
        .send({ message: "Hello" })
        .expect(400)
        .then((response) => {
          expect(response.body).toHaveProperty("issues");
          expect(response.body).toHaveProperty("name", "ZodError");
        });
    });
  });

  describe("sending", () => {
    it("skips the staging environment", async () => {
      process.env.APP_ENVIRONMENT = "staging";
      await post(ENDPOINT)
        .set({ Authorization: process.env.HASURA_PLANX_API_KEY! })
        .send(validBody)
        .expect(200)
        .then((response) => {
          expect(response.body.message).toMatch(/skipping Slack notification/);
        });
      expect(mockSend).not.toHaveBeenCalled();
    });

    it("posts to the requested channel on success", async () => {
      process.env.APP_ENVIRONMENT = "production";
      await post(ENDPOINT)
        .set({ Authorization: process.env.HASURA_PLANX_API_KEY! })
        .send(validBody)
        .expect(200)
        .then((response) => {
          expect(SlackNotify).toHaveBeenCalledWith(
            process.env.SLACK_WEBHOOK_URL,
          );
          expect(mockSend).toHaveBeenCalledWith({
            channel: validBody.channel,
            text: validBody.message,
            username: undefined,
          });
          expect(response.body.message).toMatch(/Sent Slack notification/);
        });
    });

    it("forwards an optional username override", async () => {
      process.env.APP_ENVIRONMENT = "production";
      await post(ENDPOINT)
        .set({ Authorization: process.env.HASURA_PLANX_API_KEY! })
        .send({ ...validBody, username: "Teams Bot" })
        .expect(200);

      expect(mockSend).toHaveBeenCalledWith({
        channel: validBody.channel,
        text: validBody.message,
        username: "Teams Bot",
      });
    });

    it("returns a 500 when Slack fails", async () => {
      process.env.APP_ENVIRONMENT = "production";
      mockSend.mockRejectedValue("Fail!");

      await post(ENDPOINT)
        .set({ Authorization: process.env.HASURA_PLANX_API_KEY! })
        .send(validBody)
        .expect(500)
        .then((response) => {
          expect(response.body.error).toMatch(/Failed to send Slack/);
        });
    });
  });
});
