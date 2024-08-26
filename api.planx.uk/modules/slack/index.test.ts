import SlackNotify from "slack-notify";
import supertest from "supertest";

import app from "../../server.js";
import { authHeader } from "../../tests/mockJWT.js";

const validAuth = authHeader({ role: "teamEditor" });
const validBody = {
  message: ":emoji: *council-a/find-out-if* is now online",
};
const invalidBody = {
  wrong: "message",
};

const mockSend = jest.fn();
jest.mock<typeof SlackNotify>("slack-notify", () =>
  jest.fn().mockImplementation(() => {
    return { send: mockSend };
  }),
);

afterEach(jest.clearAllMocks);

it("returns an error if authorization headers are not set", async () => {
  await supertest(app)
    .post("/send-slack-notifcation")
    .send(validBody)
    .expect(404);
});

it("returns an error if the user does not have the correct role", async () => {
  await supertest(app)
    .post("/send-slack-notification")
    .send(validBody)
    .set(authHeader({ role: "teamViewer" }))
    .expect(403);
});

it("returns an error if a message isn't provided in the request body", async () => {
  await supertest(app)
    .post("/send-slack-notification")
    .send(invalidBody)
    .set(validAuth)
    .expect(400)
    .then((res) => {
      expect(res.body).toHaveProperty("issues");
      expect(res.body).toHaveProperty("name", "ZodError");
    });
});

it("skips the staging environment", async () => {
  process.env.APP_ENVIRONMENT = "staging";
  await supertest(app)
    .post("/send-slack-notification")
    .send(validBody)
    .set(validAuth)
    .expect(200)
    .then((res) => {
      expect(res.body).toHaveProperty("message");
      expect(res.body.message).toMatch(
        /Staging environment, skipping Slack notification. Message/,
      );
    });
});

it("successfully sends a Slack message", async () => {
  process.env.APP_ENVIRONMENT = "production";
  await supertest(app)
    .post("/send-slack-notification")
    .send(validBody)
    .set(validAuth)
    .expect(200)
    .then((res) => {
      expect(SlackNotify).toHaveBeenCalledWith(process.env.SLACK_WEBHOOK_URL);
      expect(mockSend).toHaveBeenCalledTimes(1);
      expect(res.body.message).toEqual(
        'Sent Slack notification. Message ":emoji: *council-a/find-out-if* is now online"',
      );
    });
});

it("returns an error when Slack fails", async () => {
  process.env.APP_ENVIRONMENT = "production";
  mockSend.mockRejectedValue("Fail!");

  await supertest(app)
    .post("/send-slack-notification")
    .send(validBody)
    .set(validAuth)
    .expect(500)
    .then((res) => {
      expect(mockSend).toHaveBeenCalledTimes(1);
      expect(res.body.error).toMatch(
        /Failed to send Slack notification. Error/,
      );
    });
});
