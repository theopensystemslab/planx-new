import supertest from "supertest";
import { queryMock } from "../../../../tests/graphqlQueryMock.js";
import app from "../../../../server.js";
import { NOTIFY_TEST_EMAIL } from "../../../../lib/notify/utils.js";
import { sendEmail } from "../../../../lib/notify/index.js";
import { DEVOPS_EMAIL_REPLY_TO_ID } from "../../../../lib/notify/templates/index.js";

vi.mock("../../../../lib/notify/index.js", () => ({
  sendEmail: vi.fn(),
}));

const ENDPOINT = "/email-download-link";

describe("send a format new download link via email", () => {
  it("returns an error if a matching session cannot be found", async () => {
    queryMock.mockQuery({
      name: "GetSessionForDownloadLink",
      matchOnVariables: false,
      data: {
        session: null,
      },
    });

    await supertest(app)
      .post(ENDPOINT)
      .send({
        sessionId: "33d373d4-fff2-4ef7-a5f2-2a36e39ccc49",
        localAuthority: "lambeth",
        flowSlug: "report-a-planning-breach",
      })
      .expect(404)
      .then((res) => expect(res.body.error).toMatch(/SESSION_NOT_FOUND/));
  });

  it("returns an error if an email has already been triggered (access token exists)", async () => {
    queryMock.mockQuery({
      name: "GetSessionForDownloadLink",
      matchOnVariables: false,
      data: {
        session: {
          id: "33d373d4-fff2-4ef7-a5f2-2a36e39ccc49",
          submittedAt: "2026-05-01T01:02:03.865452+00:00",
          flow: {
            id: "66d373d4-fff2-4ef7-a5f2-2a36e39ccc49",
            name: "Report a planning breach",
            team: {
              id: 123,
            },
          },
        },
      },
    });

    queryMock.mockQuery({
      name: "InsertApplicationAccessToken",
      graphqlErrors: [{ message: "Something went wrong" }],
      data: {},
      matchOnVariables: false,
    });

    await supertest(app)
      .post(ENDPOINT)
      .send({
        sessionId: "33d373d4-fff2-4ef7-a5f2-2a36e39ccc49",
        localAuthority: "lambeth",
        flowSlug: "report-a-planning-breach",
      })
      .expect(409)
      .then((res) => expect(res.body.error).toMatch(/LINK_ALREADY_EMAILED/));
  });

  it("errors if this team does not have a 'submission_email'", async () => {
    queryMock.mockQuery({
      name: "GetSessionForDownloadLink",
      matchOnVariables: false,
      data: {
        session: {
          id: "33d373d4-fff2-4ef7-a5f2-2a36e39ccc49",
          submittedAt: "2026-05-01T01:02:03.865452+00:00",
          flow: {
            id: "66d373d4-fff2-4ef7-a5f2-2a36e39ccc49",
            name: "Report a planning breach",
            team: {
              id: 123,
            },
          },
        },
      },
    });

    queryMock.mockQuery({
      name: "InsertApplicationAccessToken",
      matchOnVariables: false,
      data: {
        applicationAccessTokens: {
          token: "mock-access-token",
        },
      },
    });

    queryMock.mockQuery({
      name: "GetFlowSubmissionEmail",
      matchOnVariables: false,
      data: {
        flowsByPK: {
          submissionEmailId: null,
          submissionIntegration: {
            submissionEmail: null,
          },
        },
      },
    });

    queryMock.mockQuery({
      name: "GetDefaultSubmissionIntegration",
      data: {
        submissionIntegrations: [
          {
            submissionEmail: null,
          },
        ],
      },
      matchOnVariables: false,
    });

    await supertest(app)
      .post(ENDPOINT)
      .send({
        sessionId: "33d373d4-fff2-4ef7-a5f2-2a36e39ccc49",
        localAuthority: "lambeth",
        flowSlug: "report-a-planning-breach",
      })
      .expect(400)
      .then((res) => expect(res.body.error).toMatch(/EMAIL_NOT_CONFIGURED/));
  });

  it("errors if there's an unhandled exception", async () => {
    queryMock.mockQuery({
      name: "GetSessionForDownloadLink",
      graphqlErrors: [{ message: "Something went wrong" }],
      data: {},
      matchOnVariables: false,
    });

    await supertest(app)
      .post(ENDPOINT)
      .send({
        sessionId: "33d373d4-fff2-4ef7-a5f2-2a36e39ccc49",
        localAuthority: "lambeth",
        flowSlug: "report-a-planning-breach",
      })
      .expect(500)
      .then((res) =>
        expect(res.body.error).toMatch(
          /Failed to send "new-download-link" email/,
        ),
      );
  });

  it("send an email, with a valid download link, to the correct email address", async () => {
    queryMock.mockQuery({
      name: "GetSessionForDownloadLink",
      matchOnVariables: false,
      data: {
        session: {
          id: "33d373d4-fff2-4ef7-a5f2-2a36e39ccc49",
          submittedAt: "2026-05-01T01:02:03.865452+00:00",
          flow: {
            id: "66d373d4-fff2-4ef7-a5f2-2a36e39ccc49",
            name: "Report a planning breach",
            team: {
              id: 123,
            },
          },
        },
      },
    });

    queryMock.mockQuery({
      name: "InsertApplicationAccessToken",
      matchOnVariables: false,
      data: {
        applicationAccessTokens: {
          token: "mock-access-token",
        },
      },
    });

    queryMock.mockQuery({
      name: "GetFlowSubmissionEmail",
      matchOnVariables: false,
      data: {
        flowsByPK: {
          submissionEmailId: "fb75d140-cddf-4405-af7b-c93ec2ecfc03",
          submissionIntegration: {
            submissionEmail: NOTIFY_TEST_EMAIL,
          },
        },
      },
    });

    await supertest(app)
      .post(ENDPOINT)
      .send({
        sessionId: "33d373d4-fff2-4ef7-a5f2-2a36e39ccc49",
        localAuthority: "lambeth",
        flowSlug: "report-a-planning-breach",
      })
      .expect(200)
      .then((res) => {
        expect(res.body).toEqual({
          message: "An email sent to your inbox",
        });

        expect(sendEmail).toHaveBeenCalledWith(
          "new-download-link",
          NOTIFY_TEST_EMAIL,
          expect.objectContaining({
            emailReplyToId: DEVOPS_EMAIL_REPLY_TO_ID,
            personalisation: expect.objectContaining({
              downloadLink:
                "https://www.example.com/download-submission?token=mock-access-token",
              serviceName: "Report a planning breach",
              sessionId: "33d373d4-fff2-4ef7-a5f2-2a36e39ccc49",
            }),
          }),
        );
      });
  });
});
