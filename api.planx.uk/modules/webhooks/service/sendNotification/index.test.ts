import supertest from "supertest";
import app from "../../../../server";
import SlackNotify from "slack-notify";
import { BOPSBody, EmailBody, UniformBody } from "./types";
import { $admin } from "../../../../client";
import { CoreDomainClient } from "@opensystemslab/planx-core";

const mockSessionWithFee = {
  data: {
    passport: {
      data: {
        "application.fee.payable": "123",
      },
    },
  },
};

const mockSessionWithDisabilityExemption = {
  data: {
    passport: {
      data: {
        "application.fee.exemption.disability": ["true"],
      },
    },
  },
};

const mockSessionWithResubmissionExemption = {
  data: {
    passport: {
      data: {
        "application.fee.exemption.resubmission": ["true"],
      },
    },
  },
};

jest.mock<CoreDomainClient>("../../../../client");
const mockAdmin = jest.mocked($admin);

const mockSend = jest.fn();
jest.mock<typeof SlackNotify>("slack-notify", () =>
  jest.fn().mockImplementation(() => {
    return { send: mockSend };
  }),
);

const { post } = supertest(app);

describe("Send Slack notifications endpoint", () => {
  const ENDPOINT = "/webhooks/hasura/send-slack-notification";
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
    mockAdmin.session.find = jest.fn().mockResolvedValue(mockSessionWithFee);
    mockSend.mockResolvedValue("Success!");
  });

  afterEach(jest.clearAllMocks);

  afterAll(() => (process.env = ORIGINAL_ENV));

  describe("authentication and validation", () => {
    it("fails without correct authentication", async () => {
      await post(ENDPOINT)
        .expect(401)
        .then((response) => {
          expect(response.body).toEqual({
            error: "Unauthorised",
          });
        });
    });

    it("returns a 400 if 'type' is missing", async () => {
      const body = { event: {} };
      await post(ENDPOINT)
        .set({ Authorization: process.env.HASURA_PLANX_API_KEY })
        .send(body)
        .expect(400)
        .then((response) => {
          expect(response.body).toHaveProperty("issues");
          expect(response.body).toHaveProperty("name", "ZodError");
        });
    });

    it("returns a 400 if 'type' is incorrect", async () => {
      const body = { event: {} };
      await post(ENDPOINT + "?type=test-submission")
        .set({ Authorization: process.env.HASURA_PLANX_API_KEY })
        .send(body)
        .expect(400)
        .then((response) => {
          expect(response.body).toHaveProperty("issues");
          expect(response.body).toHaveProperty("name", "ZodError");
        });
    });

    it("returns a 400 if 'event' is missing", async () => {
      await post(ENDPOINT + "?type=bops-submission")
        .set({ Authorization: process.env.HASURA_PLANX_API_KEY })
        .expect(400)
        .then((response) => {
          expect(response.body).toHaveProperty("issues");
          expect(response.body).toHaveProperty("name", "ZodError");
        });
    });
  });

  describe("BOPS notifications", () => {
    const body: BOPSBody = {
      event: {
        data: {
          new: {
            session_id: "xyz123",
            bops_id: "abc123",
            destination_url: "https://www.bops-production.com",
          },
        },
      },
    };

    it("skips the staging environment", async () => {
      process.env.APP_ENVIRONMENT = "staging";
      await post(ENDPOINT)
        .query({ type: "bops-submission" })
        .set({ Authorization: process.env.HASURA_PLANX_API_KEY })
        .send(body)
        .expect(200)
        .then((response) => {
          expect(response.body.message).toMatch(/skipping Slack notification/);
        });
    });

    it("posts to Slack on success", async () => {
      process.env.APP_ENVIRONMENT = "production";

      await post(ENDPOINT)
        .query({ type: "bops-submission" })
        .set({ Authorization: process.env.HASURA_PLANX_API_KEY })
        .send(body)
        .expect(200)
        .then((response) => {
          expect(SlackNotify).toHaveBeenCalledWith(
            process.env.SLACK_WEBHOOK_URL,
          );
          expect(mockSend).toHaveBeenCalledTimes(1);
          expect(response.body.message).toBe("Posted to Slack");
          expect(response.body.data).toMatch(/abc123/);
          expect(response.body.data).toMatch(/www.bops-production.com/);
        });
    });

    it("returns error when Slack fails", async () => {
      process.env.APP_ENVIRONMENT = "production";
      mockSend.mockRejectedValue("Fail!");

      await post(ENDPOINT)
        .query({ type: "bops-submission" })
        .set({ Authorization: process.env.HASURA_PLANX_API_KEY })
        .send(body)
        .expect(500)
        .then((response) => {
          expect(mockSend).toHaveBeenCalledTimes(1);
          expect(response.body.error).toMatch(/Failed to send/);
        });
    });
  });

  describe("Uniform notifications", () => {
    const body: UniformBody = {
      event: {
        data: {
          new: {
            payload: { sessionId: "xyz123" },
            submission_reference: "abc123",
            response: {
              organisation: "test-council",
            },
          },
        },
      },
    };

    it("skips the staging environment", async () => {
      process.env.APP_ENVIRONMENT = "staging";
      await post(ENDPOINT)
        .query({ type: "uniform-submission" })
        .set({ Authorization: process.env.HASURA_PLANX_API_KEY })
        .send(body)
        .expect(200)
        .then((response) => {
          expect(response.body.message).toMatch(/skipping Slack notification/);
        });
    });

    it("posts to Slack on success", async () => {
      process.env.APP_ENVIRONMENT = "production";

      await post(ENDPOINT)
        .query({ type: "uniform-submission" })
        .set({ Authorization: process.env.HASURA_PLANX_API_KEY })
        .send(body)
        .expect(200)
        .then((response) => {
          expect(SlackNotify).toHaveBeenCalledWith(
            process.env.SLACK_WEBHOOK_URL,
          );
          expect(mockSend).toHaveBeenCalledTimes(1);
          expect(mockAdmin.session.find).toHaveBeenCalledTimes(1);
          expect(response.body.message).toBe("Posted to Slack");
          expect(response.body.data).toMatch(/abc123/);
        });
    });

    it("adds a status to the Slack message for a disability exemption", async () => {
      process.env.APP_ENVIRONMENT = "production";
      mockAdmin.session.find = jest
        .fn()
        .mockResolvedValue(mockSessionWithDisabilityExemption);

      await post(ENDPOINT)
        .query({ type: "uniform-submission" })
        .set({ Authorization: process.env.HASURA_PLANX_API_KEY })
        .send(body)
        .expect(200)
        .then((response) => {
          expect(response.body.data).toMatch(/[Exempt]/);
        });
    });

    it("adds a status to the Slack message for a resubmission exemption", async () => {
      process.env.APP_ENVIRONMENT = "production";
      mockAdmin.session.find = jest
        .fn()
        .mockResolvedValue(mockSessionWithResubmissionExemption);

      await post(ENDPOINT)
        .query({ type: "uniform-submission" })
        .set({ Authorization: process.env.HASURA_PLANX_API_KEY })
        .send(body)
        .expect(200)
        .then((response) => {
          expect(response.body.data).toMatch(/[Resubmission]/);
        });
    });

    it("handles missing sessions", async () => {
      process.env.APP_ENVIRONMENT = "production";
      mockAdmin.session.find = jest.fn().mockResolvedValueOnce(null);

      await post(ENDPOINT)
        .query({ type: "uniform-submission" })
        .set({ Authorization: process.env.HASURA_PLANX_API_KEY })
        .send(body)
        .expect(500)
        .then((response) => {
          expect(mockAdmin.session.find).toHaveBeenCalledTimes(1);
          expect(response.body.error).toMatch(/Failed to send/);
        });
    });

    it("returns error when Slack fails", async () => {
      process.env.APP_ENVIRONMENT = "production";
      mockSend.mockRejectedValue("Fail!");

      await post(ENDPOINT)
        .query({ type: "uniform-submission" })
        .set({ Authorization: process.env.HASURA_PLANX_API_KEY })
        .send(body)
        .expect(500)
        .then((response) => {
          expect(mockSend).toHaveBeenCalledTimes(1);
          expect(response.body.error).toMatch(/Failed to send/);
        });
    });
  });

  describe("Email notifications", () => {
    const body: EmailBody = {
      event: {
        data: {
          new: {
            session_id: "abc123",
            team_slug: "testTeam",
            request: {
              personalisation: {
                serviceName: "testServiceName",
              },
            },
          },
        },
      },
    };

    it("skips the staging environment", async () => {
      process.env.APP_ENVIRONMENT = "staging";
      await post(ENDPOINT)
        .query({ type: "email-submission" })
        .set({ Authorization: process.env.HASURA_PLANX_API_KEY })
        .send(body)
        .expect(200)
        .then((response) => {
          expect(response.body.message).toMatch(/skipping Slack notification/);
        });
    });

    it("posts to Slack on success", async () => {
      process.env.APP_ENVIRONMENT = "production";

      await post(ENDPOINT)
        .query({ type: "email-submission" })
        .set({ Authorization: process.env.HASURA_PLANX_API_KEY })
        .send(body)
        .expect(200)
        .then((response) => {
          expect(SlackNotify).toHaveBeenCalledWith(
            process.env.SLACK_WEBHOOK_URL,
          );
          expect(mockSend).toHaveBeenCalledTimes(1);
          expect(response.body.message).toBe("Posted to Slack");
          expect(response.body.data).toMatch(/abc123/);
          expect(response.body.data).toMatch(/testTeam/);
          expect(response.body.data).toMatch(/testServiceName/);
        });
    });

    it("returns error when Slack fails", async () => {
      process.env.APP_ENVIRONMENT = "production";
      mockSend.mockRejectedValue("Fail!");

      await post(ENDPOINT)
        .query({ type: "email-submission" })
        .set({ Authorization: process.env.HASURA_PLANX_API_KEY })
        .send(body)
        .expect(500)
        .then((response) => {
          expect(mockSend).toHaveBeenCalledTimes(1);
          expect(response.body.error).toMatch(/Failed to send/);
        });
    });
  });
});
