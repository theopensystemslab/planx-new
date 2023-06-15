import { queryMock } from "../tests/graphqlQueryMock";
import { sendToEmail } from "./email";

const mockGenerateCSVData = jest.fn().mockResolvedValue([
  {
    question: "Is this a test?",
    responses: [{ value: "Yes" }],
    metadata: {},
  },
]);

jest.mock("@opensystemslab/planx-core", () => {
  return {
    Passport: jest.fn().mockImplementation(() => ({
      getFiles: jest.fn().mockImplementation(() => []),
    })),
    CoreDomainClient: jest.fn().mockImplementation(() => ({
      getDocumentTemplateNamesForSession: jest.fn(),
      generateCSVData: () => mockGenerateCSVData(),
    })),
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
      data: {
        lowcal_sessions_by_pk: { data: {} },
      },
      variables: { id: "123" },
    });

    queryMock.mockQuery({
      name: "GetSessionEmailDetails",
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
      data: {
        update_lowcal_sessions_by_pk: { id: "123" },
      },
      variables: { sessionId: "123" },
    });

    queryMock.mockQuery({
      name: "CreateEmailApplication",
      data: {
        insert_email_applications_one: { id: 1 },
      },
      variables: {
        sessionId: "123",
        teamSlug: "southwark",
        recipient: "planners@southwark.gov.uk",
        request: {
          personalisation: {
            serviceName: "Test flow",
            emailReplyToId: "abc123",
            applicantEmail: "applicant@test.com",
            downloadLink: `${process.env.API_URL_EXT}/download-application-files/123?email=planners@southwark.gov.uk&localAuthority=southwark`,
            sessionId: "123",
          },
        },
        response: {
          message: "Success",
        },
      },
    });
  });

  it("succeeds when provided with valid data", async () => {
    const response = await sendToEmail({
      sessionId: "123",
      localAuthority: "southwark",
    });
    expect(response).toEqual({
      message: 'Successfully sent "Submit" email',
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
      variables: { slug: "other-council" },
    });

    const response = sendToEmail({
      sessionId: "123",
      localAuthority: "other-council",
    });
    await expect(response).rejects.toEqual(
      new Error("Send to email is not enabled for this local authority.")
    );
  });
});
