import supertest from "supertest";
import app from "../server";
import { createScheduledEvent } from "../hasura/metadata";
import { queryMock } from "../tests/graphqlQueryMock";
import { flowWithInviteToPay } from "../tests/mocks/inviteToPayData";

jest.mock("../hasura/metadata");
const mockedCreateScheduledEvent = createScheduledEvent as jest.MockedFunction<
  typeof createScheduledEvent
>;

describe("Create payment send events webhook", () => {
  const ENDPOINT = "/webhooks/hasura/create-payment-send-events";

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
          "Missing payload data to create payment send events",
        ),
      );
  });

  it("returns a 200 on successful event setup", async () => {
    mockedCreateScheduledEvent.mockResolvedValue("test-event-id");

    await supertest(app)
      .post(ENDPOINT)
      .set({ Authorization: process.env.HASURA_PLANX_API_KEY })
      .send({ payload: { sessionId: "123" } })
      .expect(200)
      .then((response) => {
        expect(response.body).toMatchObject({ email: "test-event-id" });
      });
  });

  it("passes the correct arguments along to createScheduledEvent", async () => {
    const body = { createdAt: new Date(), payload: { sessionId: "123" } };
    mockedCreateScheduledEvent.mockResolvedValue("test-event-id");

    await supertest(app)
      .post(ENDPOINT)
      .set({ Authorization: process.env.HASURA_PLANX_API_KEY })
      .send(body)
      .expect(200)
      .then((response) => {
        expect(response.body).toMatchObject({ email: "test-event-id" });
      });

    const mockArgs = mockedCreateScheduledEvent.mock.calls[0][0];
    expect(mockArgs.webhook).toBe(
      "{{HASURA_PLANX_API_URL}}/email-submission/southwark",
    );
    expect(mockArgs.payload).toMatchObject(body.payload);
    expect(mockArgs.comment).toBe(`email_submission_${body.payload.sessionId}`);
  });

  it("returns a 500 on event setup failure", async () => {
    const body = { createdAt: new Date(), payload: { sessionId: "123" } };
    mockedCreateScheduledEvent.mockRejectedValue(new Error("Failed!"));

    await supertest(app)
      .post(ENDPOINT)
      .set({ Authorization: process.env.HASURA_PLANX_API_KEY })
      .send(body)
      .expect(500)
      .then((response) => {
        expect(response.body.error).toMatch(
          /Failed to create payment send event/,
        );
      });
  });
});
