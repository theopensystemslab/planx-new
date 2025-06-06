import supertest from "supertest";
import type * as planxCore from "@opensystemslab/planx-core";
import type { ExportClient } from "@opensystemslab/planx-core";
import { queryMock } from "../../../tests/graphqlQueryMock.js";
import app from "../../../server.js";

const mockGenerateCSVData = vi.fn().mockResolvedValue([
  {
    question: "Is this a test?",
    responses: [{ value: "Yes" }],
    metadata: {},
  },
]);

vi.mock("@opensystemslab/planx-core", async () => {
  const actualCore = await vi.importActual<typeof planxCore>(
    "@opensystemslab/planx-core",
  );
  const mockPassport = vi.fn().mockImplementation(() => ({
    files: vi.fn().mockImplementation(() => []),
  }));
  const mockCoreDomainClient = class extends actualCore.CoreDomainClient {
    constructor() {
      super();
      this.getDocumentTemplateNamesForSession = vi.fn();
      this.export.csvData = () => mockGenerateCSVData();
    }
  };

  return {
    ...actualCore,
    Passport: mockPassport,
    CoreDomainClient: mockCoreDomainClient,
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
      name: "GetSessionEmailDetails",
      matchOnVariables: true,
      data: {
        session: {
          email: "simulate-delivered@notifications.service.gov.uk",
          flow: { slug: "test-flow", name: "Test Flow" },
          passportData: {
            _address: {
              single_line_address: "Bag End, Underhill, Hobbiton",
            },
            "proposal.projectType": "",
            "applicant.name.first": "Bilbo",
            "applicant.name.last": "Baggins",
            "application.fee.payable": 100,
          },
        },
      },
      variables: { id: "33d373d4-fff2-4ef7-a5f2-2a36e39ccc49" },
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

  it("errors if this team does not have a 'submission_email' configured in teams", async () => {
    queryMock.mockQuery({
      name: "GetTeamEmailSettings",
      matchOnVariables: false,
      data: {
        teams: [
          {
            teamSettings: {
              emailReplyToId: "727d48fa-cb8a-42f9-b8b2-55032f3bb451",
              submissionEmail: null,
            },
          },
        ],
      },
      variables: { slug: "southwark" },
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
        "/download-application-files/33d373d4-fff2-4ef7-a5f2-2a36e39ccc49?email=planning.office.example@council.gov.uk&localAuthority=southwark",
      )
      .expect(200)
      .then((_res) => {
        expect(mockBuildSubmissionExportZip).toHaveBeenCalledWith({
          sessionId: "33d373d4-fff2-4ef7-a5f2-2a36e39ccc49",
          includeDigitalPlanningJSON: true,
        });
      });
  });
});
