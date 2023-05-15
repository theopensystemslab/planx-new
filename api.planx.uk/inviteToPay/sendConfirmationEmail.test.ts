import supertest from "supertest";
import app from "../server";
import { queryMock } from "../tests/graphqlQueryMock";
import { sendAgentAndPayeeConfirmationEmail } from "./sendConfirmationEmail";
import { sendEmail } from "../notify/notify";

jest.mock("../notify/notify", () => ({
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
                payeeEmail,
                payeeName: "payeeName",
                paymentAmount: "20",
                applicantName: "xyz",
              },
            ],
          },
        ],
      },
    });
    const expectedConfig = {
      personalisation: {
        applicantEmail: agentEmail,
        emailReplyToId: "123",
        helpEmail: "help@email.com",
        helpOpeningHours: "9-5",
        helpPhone: "123",
        serviceName: "Some flow",
      },
    };
    await sendAgentAndPayeeConfirmationEmail("mockSessionId");
    expect(sendEmail).toHaveBeenCalledWith(
      "confirmation-agent",
      agentEmail,
      expectedConfig
    );
    expect(sendEmail).toHaveBeenCalledWith(
      "confirmation-payee",
      payeeEmail,
      expectedConfig
    );
  });
});

describe("Invite to pay confirmation templates cannot be sent individually", () => {
  for (const template of ["confirmation-payee", "confirmation-agent"]) {
    test(`the "${template}" template`, async () => {
      const data = {
        payload: {
          sessionId: "TestSesionID",
          isLocked: true,
        },
      };
      await supertest(app)
        .post(`/send-email/${template}`)
        .set("Authorization", "testtesttest")
        .send(data)
        .expect(400, {
          error: `Failed to send "${template}" email. Invalid template`,
        });
    });
  }
});
