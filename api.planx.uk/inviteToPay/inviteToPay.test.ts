import supertest from "supertest";
import { queryMock } from "../tests/graphqlQueryMock";
import app from "../server";
import {
  validSessionQueryMock,
  notFoundQueryMock,
  notFoundLockSessionQueryMock,
  detailedValidSessionQueryMock,
  lockSessionQueryMock,
  unlockSessionQueryMock,
  createPaymentRequestQueryMock,
} from "../tests/mocks/inviteToPayMocks";
import {
  payee,
  validSession,
  notFoundSession,
  newPaymentRequest,
} from "../tests/mocks/inviteToPayData";

describe("Invite to pay API route", () => {
  const inviteToPayBaseRoute = "/invite-to-pay";
  const validSessionURL = `${inviteToPayBaseRoute}/${validSession.id}`;
  const notFoundSessionURL = `${inviteToPayBaseRoute}/${notFoundSession.id}`;
  const validPostBody = {
    payeeEmail: payee.email,
    payeeName: payee.name,
    sessionPreviewKeys: [
      ["_address", "title"],
      ["applicant.agent.name.first"],
      ["applicant.agent.name.last"],
      ["proposal.projectType"],
    ],
  };

  beforeEach(() => {
    queryMock.mockQuery(validSessionQueryMock);
    queryMock.mockQuery(lockSessionQueryMock);
    queryMock.mockQuery(unlockSessionQueryMock);
    queryMock.mockQuery(notFoundQueryMock);
    queryMock.mockQuery(notFoundLockSessionQueryMock);
    queryMock.mockQuery(detailedValidSessionQueryMock);
    queryMock.mockQuery(createPaymentRequestQueryMock);
  });

  afterEach(() => {
    queryMock.reset();
  });

  describe("valid request scenarios", () => {
    test("a valid sessionId", async () => {
      await supertest(app)
        .post(validSessionURL)
        .send(validPostBody)
        .expect(200)
        .then((response) => {
          expect(response.body).toEqual(newPaymentRequest);
        });
    });
  });

  describe("invalid request scenarios", () => {
    test("route without a sessionId parameter", async () => {
      await supertest(app).post("/invite-to-pay").expect(404);
    });

    test("a missing payee name", async () => {
      const invalidPostBody = { ...validPostBody, payeeName: null };
      await supertest(app)
        .post(validSessionURL)
        .send(invalidPostBody)
        .expect(400)
        .then((response) => {
          expect(response.body).toHaveProperty(
            "error",
            "JSON body must contain payeeName"
          );
        });
    });

    test("a missing payee email address", async () => {
      const invalidPostBody = { ...validPostBody, payeeEmail: null };
      await supertest(app)
        .post(validSessionURL)
        .send(invalidPostBody)
        .expect(400)
        .then((response) => {
          expect(response.body).toHaveProperty(
            "error",
            "JSON body must contain payeeEmail"
          );
        });
    });

    test("a sessionId that cannot be found", async () => {
      await supertest(app)
        .post(notFoundSessionURL)
        .send(validPostBody)
        .expect(404)
        .then((response) => {
          expect(response.body).toHaveProperty("error", "session not found");
        });
    });
  });
});
