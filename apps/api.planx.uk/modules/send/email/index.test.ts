import supertest from "supertest";
import type * as planxCore from "@opensystemslab/planx-core";
import { queryMock } from "../../../tests/graphqlQueryMock.js";
import app from "../../../server.js";

vi.mock("@opensystemslab/planx-core", async () => {
  const actualCore = await vi.importActual<typeof planxCore>(
    "@opensystemslab/planx-core",
  );
  const mockPassport = class MockPassport {
    files = vi.fn().mockImplementation(() => []);
  };

  return {
    ...actualCore,
    Passport: mockPassport,
  };
});

const mockBuildSubmissionExportZip = vi.fn().mockImplementation(() => ({
  write: () => "zip",
  toBuffer: () => Buffer.from("test"),
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  remove: () => {},
}));

vi.mock("../utils/exportZip", () => {
  return {
    buildSubmissionExportZip: (input: string) =>
      Promise.resolve(mockBuildSubmissionExportZip(input)),
  };
});

describe(`sending an application by email to a planning office`, () => {
  beforeEach(() => {
    queryMock.mockQuery({
      name: "GetTeamEmailSettings",
      matchOnVariables: false,
      data: {
        teams: [
          {
            teamId: 1,
            teamSettings: {
              emailReplyToId: "727d48fa-cb8a-42f9-b8b2-55032f3bb451",
              submissionEmail: "planning.office.example@council.gov.uk",
            },
          },
        ],
      },
      variables: { slug: "southwark" },
    });

    queryMock.mockQuery({
      name: "GetSessionData",
      data: {
        session: { data: {} },
      },
      variables: { id: "33d373d4-fff2-4ef7-a5f2-2a36e39ccc49" },
      matchOnVariables: true,
    });

    queryMock.mockQuery({
      name: "MarkSessionAsSubmitted",
      matchOnVariables: false,
      data: {
        session: { id: "33d373d4-fff2-4ef7-a5f2-2a36e39ccc49" },
      },
      variables: { sessionId: "33d373d4-fff2-4ef7-a5f2-2a36e39ccc49" },
    });

    queryMock.mockQuery({
      name: "CreateEmailApplication",
      matchOnVariables: false,
      data: {
        application: { id: 1 },
      },
      variables: {
        sessionId: "33d373d4-fff2-4ef7-a5f2-2a36e39ccc49",
        teamSlug: "southwark",
        recipient: "planning.office.example@council.gov.uk",
        request: {
          personalisation: {
            serviceName: "Apply for something",
            downloadLink: "https://api.editor.planx.uk/test/123",
          },
        },
        response: {
          message: "Success",
        },
      },
    });

    queryMock.mockQuery({
      name: "FindApplication",
      matchOnVariables: false,
      data: {
        emailApplications: [],
      },
      variables: {
        session_id: "33d373d4-fff2-4ef7-a5f2-2a36e39ccc49",
      },
    });

    queryMock.mockQuery({
      name: "GetFlowId",
      matchOnVariables: true,
      data: {
        lowcalSessions: [{ flowId: "91693304-fc37-4079-8ec3-e33a6164a27a" }],
      },
      variables: { session_id: "33d373d4-fff2-4ef7-a5f2-2a36e39ccc49" },
    });

    queryMock.mockQuery({
      name: "GetFlowSubmissionEmail",
      matchOnVariables: true,
      data: {
        flowIntegrations: [
          {
            emailId: "727d48fa-cb8a-42f9-b8b2-55032f3bb451",
            submissionIntegration: {
              submissionEmail: "planning.office.example@council.gov.uk",
            },
          },
        ],
      },
      variables: { flowId: "91693304-fc37-4079-8ec3-e33a6164a27a" },
    });

    queryMock.mockQuery({
      name: "GetSessionEmailDetails",
      matchOnVariables: false,
      data: {
        session: {
          passportData: {},
          email: "email@email.com",
          flow: {
            slug: "a-flow",
            name: "A Flow",
          },
        },
      },
      variables: { id: "33d373d4-fff2-4ef7-a5f2-2a36e39ccc49" },
    });
  });

  it("succeeds when provided with valid data", async () => {
    await supertest(app)
      .post("/email-submission/southwark")
      .set({ Authorization: process.env.HASURA_PLANX_API_KEY! })
      .send({ payload: { sessionId: "33d373d4-fff2-4ef7-a5f2-2a36e39ccc49" } })
      .expect(200)
      .then((res) => {
        expect(res.body).toEqual({
          message: `Successfully sent to email`,
          inbox: "planning.office.example@council.gov.uk",
          govuk_notify_template: "Submit",
        });
      });
  });

  it("fails without authorization header", async () => {
    await supertest(app)
      .post("/email-submission/southwark")
      .send({ payload: { sessionId: "33d373d4-fff2-4ef7-a5f2-2a36e39ccc49" } })
      .expect(401);
  });

  it("errors if the payload body does not include a sessionId", async () => {
    await supertest(app)
      .post("/email-submission/southwark")
      .set({ Authorization: process.env.HASURA_PLANX_API_KEY! })
      .send({
        payload: { somethingElse: "33d373d4-fff2-4ef7-a5f2-2a36e39ccc49" },
      })
      .expect(400)
      .then((res) => {
        expect(res.body).toHaveProperty("issues");
        expect(res.body).toHaveProperty("name", "ZodError");
      });
  });

  it("errors if this team does not have a 'submission_email'", async () => {
    queryMock.mockQuery({
      name: "GetFlowSubmissionEmail",
      matchOnVariables: false,
      data: {
        flowIntegrations: [
          {
            emailId: null,
            submissionIntegration: {
              submissionEmail: null,
            },
          },
        ],
      },
      variables: { flowId: "11111111-1111-1111-1111-111111111111" },
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
      variables: { teamId: 1 },
    });

    await supertest(app)
      .post("/email-submission/other-council")
      .set({ Authorization: process.env.HASURA_PLANX_API_KEY! })
      .send({ payload: { sessionId: "33d373d4-fff2-4ef7-a5f2-2a36e39ccc49" } })
      .expect(400)
      .then((res) => {
        expect(res.body).toEqual({
          error:
            "Send to email is not enabled for this local authority (other-council)",
        });
      });
  });

  it("exits early if the session has already been successfully submitted via email", async () => {
    queryMock.mockQuery({
      name: "FindApplication",
      matchOnVariables: false,
      data: {
        emailApplications: [
          {
            response: "Success",
          },
        ],
      },
      variables: {
        session_id: "33d373d4-fff2-4ef7-a5f2-2a36e39ccc49",
      },
    });

    await supertest(app)
      .post("/email-submission/southwark")
      .set({ Authorization: process.env.HASURA_PLANX_API_KEY! })
      .send({ payload: { sessionId: "33d373d4-fff2-4ef7-a5f2-2a36e39ccc49" } })
      .expect(200)
      .then((res) => {
        expect(res.body.error).toMatch(
          /Skipping send, already successfully submitted/,
        );
      });
  });

  it("errors if session detail can't be found", async () => {
    queryMock.mockQuery({
      name: "GetSessionEmailDetails",
      matchOnVariables: false,
      data: {
        session: null,
      },
      variables: { id: "33d373d4-fff2-4ef7-a5f2-2a36e39ccc49" },
    });

    await supertest(app)
      .post("/email-submission/other-council")
      .set({ Authorization: process.env.HASURA_PLANX_API_KEY! })
      .send({ payload: { sessionId: "33d373d4-fff2-4ef7-a5f2-2a36e39ccc49" } })
      .expect(500)
      .then((res) => {
        expect(res.body.error).toMatch(/Cannot find session/);
      });
  });
});

describe(`downloading application data received by email`, () => {
  beforeEach(() => {
    queryMock.mockQuery({
      name: "GetTeamEmailSettings",
      matchOnVariables: false,
      data: {
        teams: [
          {
            teamSettings: {
              submissionEmail: "planning.office.example@council.gov.uk",
              teamId: 1,
            },
          },
        ],
      },
      variables: { slug: "southwark" },
    });

    queryMock.mockQuery({
      name: "GetSessionData",
      matchOnVariables: true,
      data: {
        session: { data: { passport: { test: "dummy data" } } },
      },
      variables: { id: "33d373d4-fff2-4ef7-a5f2-2a36e39ccc49" },
    });

    queryMock.mockQuery({
      name: "GetFlowId",
      matchOnVariables: true,
      data: {
        lowcalSessions: [{ flowId: "91693304-fc37-4079-8ec3-e33a6164a27a" }],
      },
      variables: { session_id: "33d373d4-fff2-4ef7-a5f2-2a36e39ccc49" },
    });

    queryMock.mockQuery({
      name: "GetFlowSubmissionEmail",
      matchOnVariables: true,
      data: {
        flowIntegrations: [
          {
            emailId: "727d48fa-cb8a-42f9-b8b2-55032f3bb451",
            submissionIntegration: {
              submissionEmail: "planning.office.example@council.gov.uk",
            },
          },
        ],
      },
      variables: { flowId: "91693304-fc37-4079-8ec3-e33a6164a27a" },
    });
  });

  it("errors if required query params are missing", async () => {
    await supertest(app)
      .get("/download-application-files/123?email=planning_office@test.com")
      .expect(400)
      .then((res) => {
        expect(res.body).toEqual({
          error: "Missing values required to access application files",
        });
      });
  });

  it("errors if email query param does not match the stored database value for this team", async () => {
    await supertest(app)
      .get(
        "/download-application-files/33d373d4-fff2-4ef7-a5f2-2a36e39ccc49?email=wrong@council.gov.uk&localAuthority=southwark",
      )
      .expect(403)
      .then((res) => {
        expect(res.body).toEqual({
          error:
            "Provided email address is not enabled to access application files",
        });
      });
  });

  it("errors if session data is not found", async () => {
    queryMock.mockQuery({
      name: "GetSessionData",
      data: {
        session: { data: null },
      },
      variables: { id: "456" },
    });

    await supertest(app)
      .get(
        "/download-application-files/456?email=planning.office.example@council.gov.uk&localAuthority=southwark",
      )
      .expect(400)
      .then((res) => {
        expect(res.body.error).toMatch(
          /Failed to find session data for this sessionId/,
        );
      });
  });

  it("errors if flowId is missing in GetFlowId query response", async () => {
    queryMock.mockQuery({
      name: "GetFlowId",
      matchOnVariables: false,
      data: {
        lowcalSessions: [], // No flowId returned
      },
      variables: { session_id: "33d373d4-fff2-4ef7-a5f2-2a36e39ccc49" },
    });

    await supertest(app)
      .get(
        "/download-application-files/33d373d4-fff2-4ef7-a5f2-2a36e39ccc49?email=planning.office.example@council.gov.uk&localAuthority=southwark",
      )
      .expect(400)
      .then((res) => {
        expect(res.body.error).toMatch(
          /Failed to find flow ID for this sessionId/,
        );
      });
  });

  it.skip("errors if submissionEmail is missing in GetFlowSubmissionEmail query response", async () => {
    queryMock.mockQuery({
      name: "GetFlowSubmissionEmail",
      matchOnVariables: false,
      data: {
        flowIntegrations: [
          {
            emailId: "727d48fa-cb8a-42f9-b8b2-55032f3bb451",
            submissionIntegration: {
              submissionEmail: null, // Missing submissionEmail
            },
          },
        ],
      },
      variables: { flowId: "91693304-fc37-4079-8ec3-e33a6164a27a" },
    });

    await supertest(app)
      .get(
        "/download-application-files/33d373d4-fff2-4ef7-a5f2-2a36e39ccc49?email=planning.office.example@council.gov.uk&localAuthority=southwark",
      )
      .expect(400)
      .then((res) => {
        expect(res.body.error).toMatch(
          /Failed to retrieve submission email for this flow/,
        );
      });
  });

  it("successfully downloads application files when all data is valid", async () => {
    await supertest(app)
      .get(
        "/download-application-files/33d373d4-fff2-4ef7-a5f2-2a36e39ccc49?email=planning.office.example@council.gov.uk&localAuthority=southwark",
      )
      .expect(200)
      .then((res) => {
        expect(res.headers["content-type"]).toBe("application/octet-stream");
        expect(res.headers["content-disposition"]).toMatch(
          /attachment; filename=/,
        );
        expect(res.body).toBeInstanceOf(Buffer); // Ensure the response is a buffer
      });
  });
});
