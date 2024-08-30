import supertest from "supertest";
import { queryMock } from "../../../tests/graphqlQueryMock.js";
import app from "../../../server.js";

const mockGenerateCSVData = vi.fn().mockResolvedValue([
  {
    question: "Is this a test?",
    responses: [{ value: "Yes" }],
    metadata: {},
  },
]);

vi.mock("@opensystemslab/planx-core", async (importOriginal) => {
  const actualCore =
    await importOriginal<typeof import("@opensystemslab/planx-core")>();
  const actualCoreDomainClient = actualCore.CoreDomainClient;

  return {
    Passport: vi.fn().mockImplementation(() => ({
      files: vi.fn().mockImplementation(() => []),
    })),
    CoreDomainClient: class extends actualCoreDomainClient {
      constructor() {
        super();
        this.getDocumentTemplateNamesForSession = vi.fn();
        this.export.csvData = () => mockGenerateCSVData();
      }
    },
  };
});

const mockBuildSubmissionExportZip = vi.fn().mockImplementation(() => ({
  write: () => "zip",
  toBuffer: () => Buffer.from("test"),
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
            notifyPersonalisation: {
              emailReplyToId: "abc123",
              sendToEmail: "planning.office.example@council.gov.uk",
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
      variables: { id: "123" },
      matchOnVariables: true,
    });

    queryMock.mockQuery({
      name: "GetSessionEmailDetails",
      matchOnVariables: true,
      data: {
        session: {
          email: "simulate-delivered@notifications.service.gov.uk",
          flow: { slug: "test-flow", name: "Test Flow" },
        },
      },
      variables: { id: "123" },
    });

    queryMock.mockQuery({
      name: "MarkSessionAsSubmitted",
      matchOnVariables: false,
      data: {
        session: { id: "123" },
      },
      variables: { sessionId: "123" },
    });

    queryMock.mockQuery({
      name: "CreateEmailApplication",
      matchOnVariables: false,
      data: {
        application: { id: 1 },
      },
      variables: {
        sessionId: "123",
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
  });

  it("succeeds when provided with valid data", async () => {
    await supertest(app)
      .post("/email-submission/southwark")
      .set({ Authorization: process.env.HASURA_PLANX_API_KEY! })
      .send({ payload: { sessionId: "123" } })
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
      .send({ payload: { sessionId: "123" } })
      .expect(401);
  });

  it("errors if the payload body does not include a sessionId", async () => {
    await supertest(app)
      .post("/email-submission/southwark")
      .set({ Authorization: process.env.HASURA_PLANX_API_KEY! })
      .send({ payload: { somethingElse: "123" } })
      .expect(400)
      .then((res) => {
        expect(res.body).toEqual({
          error: "Missing application payload data to send to email",
        });
      });
  });

  it("errors if this team does not have a 'submission_email' configured in team settings", async () => {
    queryMock.mockQuery({
      name: "GetTeamEmailSettings",
      matchOnVariables: false,
      data: {
        teams: [
          {
            notifyPersonalisation: {
              emailReplyToId: "abc123",
              sendToEmail: null,
            },
          },
        ],
      },
      variables: { slug: "southwark" },
    });

    await supertest(app)
      .post("/email-submission/other-council")
      .set({ Authorization: process.env.HASURA_PLANX_API_KEY! })
      .send({ payload: { sessionId: "123" } })
      .expect(400)
      .then((res) => {
        expect(res.body).toEqual({
          error:
            "Send to email is not enabled for this local authority (other-council)",
        });
      });
  });

  it("errors if session detail can't be found", async () => {
    queryMock.mockQuery({
      name: "GetSessionEmailDetails",
      matchOnVariables: false,
      data: {
        session: null,
      },
      variables: { id: "123" },
    });

    await supertest(app)
      .post("/email-submission/other-council")
      .set({ Authorization: process.env.HASURA_PLANX_API_KEY! })
      .send({ payload: { sessionId: "123" } })
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
            notifyPersonalisation: {
              sendToEmail: "planning.office.example@council.gov.uk",
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
      variables: { id: "123" },
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
        "/download-application-files/123?email=wrong@council.gov.uk&localAuthority=southwark",
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

  it("calls addTemplateFilesToZip()", async () => {
    await supertest(app)
      .get(
        "/download-application-files/123?email=planning.office.example@council.gov.uk&localAuthority=southwark",
      )
      .expect(200)
      .then((_res) => {
        expect(mockBuildSubmissionExportZip).toHaveBeenCalledWith({
          sessionId: "123",
          includeDigitalPlanningJSON: true,
        });
      });
  });
});
