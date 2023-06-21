import supertest from "supertest";
import app from "../server";
import { queryMock } from "../tests/graphqlQueryMock";
import { flowWithInviteToPay } from "../tests/mocks/inviteToPayData";

jest.mock("../hasura/metadata");

describe("Create payment send events webhook", () => {
  const ENDPOINT = "/webhooks/hasura/requested-payment-received";

  beforeEach(() => {
    queryMock.mockQuery({
      name: "GetSessionById",
      variables: {
        id: "123",
      },
      data: {
        lowcal_sessions_by_pk: {
          id: "456",
          data: {
            passport: { data: {} },
            breadcrumbs: {},
          },
        },
      },
    });

    queryMock.mockQuery({
      name: "GetMostRecentPublishedFlow",
      matchOnVariables: false,
      data: {
        flows_by_pk: {
          published_flows: [
            {
              data: flowWithInviteToPay,
            },
          ],
        },
      },
    });

    queryMock.mockQuery({
      name: "GetTeamSlugByFlowId",
      matchOnVariables: false,
      data: {
        flows_by_pk: {
          team: {
            slug: "southwark",
          },
        },
      },
    });

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

  afterEach(() => jest.resetAllMocks());

  it("fails without correct authentication", async () => {
    await supertest(app)
      .post(ENDPOINT)
      .expect(401)
      .then((response) => {
        expect(response.body).toEqual({
          error: "Unauthorised",
        });
      });
  });

  it("returns a 400 if a required value is missing", async () => {
    await supertest(app)
      .post(ENDPOINT)
      .set({ Authorization: process.env.HASURA_PLANX_API_KEY })
      .send({ payload: { somethingElse: "123" } })
      .expect(400)
      .then((response) =>
        expect(response.body.error).toEqual(
          "Missing payload data to create payment send events"
        )
      );
  });

  it("returns a 200 on successful submission queuing", async () => {
    await supertest(app)
      .post(ENDPOINT)
      .set({ Authorization: process.env.HASURA_PLANX_API_KEY })
      .send({ payload: { sessionId: "123" } })
      .expect(200)
      .then((response) => {
        expect(response.body).toEqual({
          email: "email submission queued for session 123",
        });
      });
  });
});
