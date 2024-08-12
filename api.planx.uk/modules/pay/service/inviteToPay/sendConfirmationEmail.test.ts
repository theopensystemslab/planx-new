import supertest from "supertest";
import app from "../../../../server.js";
import { queryMock } from "../../../../tests/graphqlQueryMock.js";
import { sendAgentAndPayeeConfirmationEmail } from "./sendConfirmationEmail.js";
import { sendEmail } from "../../../../lib/notify/index.js";

jest.mock("../../../../lib/notify", () => ({
  sendEmail: jest.fn(),
}));

describe("sendAgentAndPayeeConfirmationEmail", () => {
  beforeEach(() => {
    queryMock.reset();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("sendEmail is called with agent and payee arguments", async () => {
    const agentEmail = "the-agent@notarealemailaddress.co.uk";
    const payeeEmail = "the-payee@notarealemailaddress.co.uk";
    queryMock.mockQuery({
      name: "GetDataForPayeeAndAgentEmails",
      variables: {
        sessionId: "mockSessionId",
      },
      data: {
        lowcal_sessions: [
          {
            email: agentEmail,
            flow: {
              slug: "some-flow",
              name: "Some Flow",
              team: {
                notifyPersonalisation: {
                  emailReplyToId: "123",
                  helpEmail: "help@email.com",
                  helpOpeningHours: "9-5",
                  helpPhone: "123",
                },
              },
            },
            paymentRequests: [
              {
                address: "123 PLACE",
                projectTypes: [
                  "alter.internal",
                  "alter.openings.add.doors.rear",
                  "alter.facades.paint",
                ],
                payeeEmail,
                payeeName: "payeeName",
                applicantName: "xyz",
              },
            ],
          },
        ],
      },
    });

    const expectedConfig = {
      personalisation: {
        applicantName: "xyz",
        payeeName: "payeeName",
        address: "123 PLACE",
        projectType: "Paint the facade and changes to internal walls or layout",
        emailReplyToId: "123",
        helpEmail: "help@email.com",
        helpOpeningHours: "9-5",
        helpPhone: "123",
        serviceName: "Some Flow",
      },
    };
    await sendAgentAndPayeeConfirmationEmail("mockSessionId");
    expect(sendEmail).toHaveBeenCalledWith(
      "confirmation-agent",
      agentEmail,
      expectedConfig,
    );
    expect(sendEmail).toHaveBeenCalledWith(
      "confirmation-payee",
      payeeEmail,
      expectedConfig,
    );
  });
});

describe("Invite to pay confirmation templates cannot be sent individually", () => {
  for (const template of ["confirmation-payee", "confirmation-agent"]) {
    test(`the "${template}" template`, async () => {
      const data = {
        payload: {
          sessionId: "TestSessionID",
          lockedAt: "2023-05-18T12:49:22.839068+00:00",
        },
      };
      await supertest(app)
        .post(`/send-email/${template}`)
        .set("Authorization", "testtesttest")
        .send(data)
        .expect(400)
        .then((res) => {
          expect(res.body).toHaveProperty("issues");
          expect(res.body).toHaveProperty("name", "ZodError");
        });
    });
  }
});
