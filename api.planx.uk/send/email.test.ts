import supertest from "supertest";
import { queryMock } from "../tests/graphqlQueryMock";
import app from "../server";
import * as helpers from "./helpers";

const mockGenerateCSVData = jest.fn().mockResolvedValue({
  responses: [
    {
      question: "Is this a test?",
      responses: [{ value: "Yes" }],
      metadata: {},
    },
  ],
  redactedResponses: [],
});
jest.mock("@opensystemslab/planx-core", () => {
  return {
    Passport: jest.fn().mockImplementation(() => ({
      getFiles: jest.fn().mockImplementation(() => []),
    })),
    CoreDomainClient: jest.fn().mockImplementation(() => ({
      getDocumentTemplateNamesForSession: jest.fn(),
      export: {
        csvData: () => mockGenerateCSVData(),
      },
    })),
  };
});

const mockBuildSubmissionExportZip = jest.fn().mockImplementation(() => ({
  write: () => "zip",
  toBuffer: () => Buffer.from("test"),
}));

jest.mock("./exportZip", () => {
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
            sendToEmail: "planners@southwark.gov.uk",
            notifyPersonalisation: { emailReplyToId: "abc123" },
          },
        ],
      },
      variables: { slug: "southwark" },
    });

    queryMock.mockQuery({
      name: "GetSessionData",
      matchOnVariables: false,
      data: {
        lowcal_sessions_by_pk: { data: {} },
      },
      variables: { id: "123" },
    });

    queryMock.mockQuery({
      name: "GetSessionEmailDetails",
      matchOnVariables: false,
      data: {
        lowcal_sessions_by_pk: {
          email: "applicant@test.com",
          flow: { slug: "test-flow" },
        },
      },
      variables: { id: "123" },
    });

    queryMock.mockQuery({
      name: "MarkSessionAsSubmitted",
      matchOnVariables: false,
      data: {
        update_lowcal_sessions_by_pk: { id: "123" },
      },
      variables: { sessionId: "123" },
    });

    queryMock.mockQuery({
      name: "CreateEmailApplication",
      matchOnVariables: false,
      data: {
        insert_email_applications_one: { id: 1 },
      },
      variables: {
        sessionId: "123",
        teamSlug: "southwark",
        recipient: "planning.office.example@southwark.gov.uk",
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
      .set({ Authorization: process.env.HASURA_PLANX_API_KEY })
      .send({ payload: { sessionId: "123" } })
      .expect(200)
      .then((res) => {
        expect(res.body).toEqual({
          message: 'Successfully sent "Submit" email',
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
      .set({ Authorization: process.env.HASURA_PLANX_API_KEY })
      .send({ payload: { somethingElse: "123" } })
      .expect(400)
      .then((res) => {
        expect(res.body).toEqual({
          error: "Missing application payload data to send to email",
        });
      });
  });

  it("errors if this team does not have a 'submission_email' configured in teams", async () => {
    queryMock.mockQuery({
      name: "GetTeamEmailSettings",
      matchOnVariables: false,
      data: {
        teams: [
          {
            sendToEmail: null,
            notifyPersonalisation: { emailReplyToId: "abc123" },
          },
        ],
      },
      variables: { slug: "southwark" },
    });

    await supertest(app)
      .post("/email-submission/other-council")
      .set({ Authorization: process.env.HASURA_PLANX_API_KEY })
      .send({ payload: { sessionId: "123" } })
      .expect(400)
      .then((res) => {
        expect(res.body).toEqual({
          error: "Send to email is not enabled for this local authority.",
        });
      });
  });
});

describe(`downloading application data received by email`, () => {
  beforeEach(() => {
    queryMock.mockQuery({
      name: "GetTeamEmailSettings",
      matchOnVariables: false,
      data: {
        teams: [{ sendToEmail: "planners@southwark.gov.uk" }],
      },
      variables: { slug: "southwark" },
    });

    queryMock.mockQuery({
      name: "GetSessionData",
      matchOnVariables: false,
      data: {
        lowcal_sessions_by_pk: { data: { passport: { test: "dummy data" } } },
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
        "/download-application-files/123?email=wrong@southwark.gov.uk&localAuthority=southwark",
      )
      .expect(403)
      .then((res) => {
        expect(res.body).toEqual({
          error:
            "Provided email address is not enabled to access application files",
        });
      });
  });

  it("calls addTemplateFilesToZip()", async () => {
    await supertest(app)
      .get(
        "/download-application-files/123?email=planners@southwark.gov.uk&localAuthority=southwark",
      )
      .expect(200)
      .then(() => {
        expect(mockBuildSubmissionExportZip).toHaveBeenCalledWith({
          sessionId: "123",
        });
      });
  });
});
