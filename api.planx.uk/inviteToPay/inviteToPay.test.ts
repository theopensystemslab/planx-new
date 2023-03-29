import supertest from "supertest";
import { queryMock } from "../tests/graphqlQueryMock";
import app from "../server";
import {
  validSessionQueryMock,
  notFoundQueryMock,
  checkSessionLockQueryMock,
  lockSessionQueryMock,
  createPaymentRequestQueryMock,
} from "../tests/mocks/inviteToPayMocks";
import {
  validSession,
  notFoundSession,
  validEmail,
  newPaymentRequest,
} from "../tests/mocks/inviteToPayData";

describe("Invite to pay API route", () => {
  const inviteToPayBaseRoute = "/invite-to-pay";
  const validSessionURL = `${inviteToPayBaseRoute}/${validSession.id}`;
  const notFoundSessionURL = `${inviteToPayBaseRoute}/${notFoundSession.id}`;
  const validPostBody = { payeeEmail: validEmail, agentName: "Some Agent" };

  beforeEach(() => {
    queryMock.mockQuery(validSessionQueryMock);
    queryMock.mockQuery(lockSessionQueryMock);
    queryMock.mockQuery(notFoundQueryMock);
    queryMock.mockQuery(checkSessionLockQueryMock);
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

    test("a missing agent name", async () => {
      const invalidPostBody = {};
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

    test("a missing payee email address", async () => {
      const invalidPostBody = {};
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

    test("a custom set of sessionPreviewKeys", async () => {
      await supertest(app)
        .post(validSessionURL)
        .send({
          ...validPostBody,
          sessionPreviewKeys: [["someKey"], ["some", "nested", "set"]],
        })
        .expect(200)
        .then((response) => {
          expect(response.body).toEqual({
            ...newPaymentRequest,
            sessionPreviewData: {
              someKey: "someValue",
              some: {
                nested: {
                  set: [1, 2, 3],
                },
              },
            },
          });
        });
    });

    test.todo("a session that could not be locked");
    test.todo("a session that has already been locked");
  });
});
