import supertest from "supertest";
import app from "../server";
import SlackNotify from "slack-notify";

const ENDPOINT = "/webhooks/hasura/send-slack-notification";

const mockSend = jest.fn();
jest.mock("slack-notify", () =>
  jest.fn().mockImplementation(() => {
    return { send: mockSend };
  })
);

const { post } = supertest(app);

describe("Send Slack notifications endpoint", () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ORIGINAL_ENV };
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

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

    it("returns a 404 if 'type' is missing", async () => {
      const body = { event: {} };
      await post(ENDPOINT)
        .set({ Authorization: process.env.HASURA_PLANX_API_KEY })
        .send(body)
        .expect(404)
        .then((response) => {
          expect(response.body).toEqual({
            message: "Missing info required to send a Slack notification",
          });
        });
    });

    it("returns a 404 if 'type' is incorrect", async () => {
      const body = { event: {} };
      await post(ENDPOINT + "?type=test-submission")
        .set({ Authorization: process.env.HASURA_PLANX_API_KEY })
        .send(body)
        .expect(404)
        .then((response) => {
          expect(response.body).toEqual({
            message: "Missing info required to send a Slack notification",
          });
        });
    });

    it("returns a 404 if 'event' is missing", async () => {
      await post(ENDPOINT + "?type=bops-submission")
        .set({ Authorization: process.env.HASURA_PLANX_API_KEY })
        .expect(404)
        .then((response) => {
          expect(response.body).toEqual({
            message: "Missing info required to send a Slack notification",
          });
        });
    });
  });

  const destinations = [
    {
      name: "BOPS",
      type: "bops-submission",
      stagingBody: {
        event: {
          data: {
            new: {
              destination_url: "https://www.bops-staging.com",
            },
          },
        },
      },
      prodBody: {
        event: {
          data: {
            new: {
              destination_url: "https://www.bops-production.com",
            },
          },
        },
      },
    },
    {
      name: "Uniform",
      type: "uniform-submission",
      stagingBody: {
        event: {
          data: {
            new: {
              response: {
                _links: {
                  self: {
                    href: "https://www.uniform-staging.com",
                  },
                },
              },
            },
          },
        },
      },
      prodBody: {
        event: {
          data: {
            new: {
              response: {
                _links: {
                  self: {
                    href: "https://www.uniform-production.com",
                  },
                },
              },
            },
          },
        },
      },
    },
  ];

  for (const destination of destinations) {
    describe(`${destination.name} notifications`, () => {
      afterEach(() => jest.clearAllMocks());

      it("skips the staging environment", async () => {
        process.env.APP_ENVIRONMENT = "staging";
        await post(ENDPOINT + `?type=${destination.type}`)
          .set({ Authorization: process.env.HASURA_PLANX_API_KEY })
          .send(destination.stagingBody)
          .expect(200)
          .then((response) => {
            expect(response.body.message).toMatch(
              /skipping Slack notification/
            );
          });
      });

      it("posts to Slack on success", async () => {
        process.env.APP_ENVIRONMENT = "production";
        mockSend.mockResolvedValue("Success!");

        await post(ENDPOINT + `?type=${destination.type}`)
          .set({ Authorization: process.env.HASURA_PLANX_API_KEY })
          .send(destination.prodBody)
          .expect(200)
          .then((response) => {
            expect(SlackNotify).toHaveBeenCalledWith(
              process.env.SLACK_WEBHOOK_URL
            );
            expect(mockSend).toHaveBeenCalledTimes(1);
            expect(response.body.message).toBe("Posted to Slack");
          });
      });

      it("returns error when Slack fails", async () => {
        process.env.APP_ENVIRONMENT = "production";
        mockSend.mockRejectedValue("Fail!");

        await post(ENDPOINT + `?type=${destination.type}`)
          .set({ Authorization: process.env.HASURA_PLANX_API_KEY })
          .send(destination.prodBody)
          .expect(500)
          .then((response) => {
            expect(mockSend).toHaveBeenCalledTimes(1);
            expect(response.body.error).toMatch(/Failed to send/);
            expect(response.body.error).toMatch(/Fail!/);
          });
      });
    });
  }
});
