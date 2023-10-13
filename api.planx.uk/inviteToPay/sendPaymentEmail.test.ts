import supertest from "supertest";
import app from "../server";
import { queryMock } from "../tests/graphqlQueryMock";

import {
  validatePaymentRequestNotFoundQueryMock,
  validatePaymentRequestQueryMock,
} from "../tests/mocks/inviteToPayMocks";
import { CoreDomainClient } from "@opensystemslab/planx-core";

jest
  .spyOn(CoreDomainClient.prototype, "formatRawProjectTypes")
  .mockResolvedValue("New office premises");

const TEST_PAYMENT_REQUEST_ID = "09655c28-3f34-4619-9385-cd57312acc44";

describe("Send email endpoint for invite to pay templates", () => {
  beforeEach(() => {
    queryMock.reset();
    queryMock.mockQuery(validatePaymentRequestQueryMock);
    queryMock.mockQuery(validatePaymentRequestNotFoundQueryMock);
  });

  describe("All invite to pay templates require authorisation", () => {
    const templates = [
      "invite-to-pay",
      "invite-to-pay-agent",
      "payment-reminder",
      "payment-reminder-agent",
      "payment-expiry",
      "payment-expiry-agent",
    ];

    for (const template of templates) {
      describe(`${template} Template`, () => {
        it("returns 401 UNAUTHORIZED if no auth header is provided", async () => {
          const data = {
            payload: {
              paymentRequestId: TEST_PAYMENT_REQUEST_ID,
            },
          };
          await supertest(app)
            .post(`/send-email/${template}`)
            .send(data)
            .expect(401);
        });

        it("returns 401 UNAUTHORIZED if no incorrect auth header is provided", async () => {
          const data = {
            payload: {
              paymentRequestId: TEST_PAYMENT_REQUEST_ID,
            },
          };
          await supertest(app)
            .post(`/send-email/${template}`)
            .set("Authorization", "invalid-api-key")
            .send(data)
            .expect(401);
        });

        it(`returns 200 OK if the correct headers are used`, async () => {
          const data = {
            payload: {
              paymentRequestId: TEST_PAYMENT_REQUEST_ID,
            },
          };
          await supertest(app)
            .post(`/send-email/${template}`)
            .set("Authorization", "testtesttest")
            .send(data)
            .expect(200);
        });
      });
    }
  });

  describe("'Invite to pay' templates", () => {
    const templates = ["invite-to-pay", "invite-to-pay-agent"];

    for (const template of templates) {
      describe(`${template} Template`, () => {
        it("throws an error if required data is missing", async () => {
          const missingPaymentRequestId = {
            payload: {},
          };

          await supertest(app)
            .post(`/send-email/${template}`)
            .set("Authorization", "testtesttest")
            .send(missingPaymentRequestId)
            .expect(400)
            .then((response) => {
              expect(response.body).toHaveProperty(
                "error",
                `Failed to send "${template}" email. Required \`paymentRequestId\` missing`,
              );
            });
        });

        it("sends a Notify email for a valid payment request id", async () => {
          const data = {
            payload: {
              paymentRequestId: TEST_PAYMENT_REQUEST_ID,
            },
          };

          await supertest(app)
            .post(`/send-email/${template}`)
            .set("Authorization", "testtesttest")
            .send(data)
            .expect(200)
            .then((response) => {
              expect(response.body).toEqual({ message: "Success" });
            });
        });

        it("throws an error for an invalid payment request id", async () => {
          const data = {
            payload: {
              paymentRequestId: "123-wrong-456",
            },
          };

          await supertest(app)
            .post(`/send-email/${template}`)
            .set("Authorization", "testtesttest")
            .send(data)
            .expect(500)
            .then((response) => {
              expect(response.body).toHaveProperty("error");
            });
        });
      });
    }
  });

  describe("'Payment Expiry' templates", () => {
    const templates = ["payment-expiry", "payment-expiry-agent"];
    it.todo(
      "soft deletes the payment_request when a payment expiry email is sent",
    );
  });
});
