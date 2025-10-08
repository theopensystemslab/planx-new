import supertest from "supertest";
import app from "../../../../server.js";
import { authHeader, expiredAuthHeader } from "../../../../tests/mockJWT.js";
import { queryMock } from "../../../../tests/graphqlQueryMock.js";

const ENDPOINT = "/auth/logout";

afterEach(() => queryMock.reset());

test("requests without a JWT will be rejected", async () => {
  await supertest(app)
    .post(ENDPOINT)
    .expect(401)
    .then((res) => {
      expect(res.body).toEqual({
        error: "No authorization token was found",
      });
    });
});

test("invalid tokens will be rejected", async () => {
  await supertest(app)
    .post(ENDPOINT)
    .set({ authorization: "Bearer INVALID_JWT" })
    .expect(401)
    .then((res) => {
      expect(res.body).toEqual({
        error: "jwt malformed",
      });
    });
});

test("expired tokens will be rejected", async () => {
  const auth = expiredAuthHeader({ role: "teamEditor" });

  await supertest(app)
    .post(ENDPOINT)
    .set(auth)
    .expect(302)
    .then((res) => {
      expect(res.redirect).toBe(true);
      expect(res.header.location).toMatch(/logout/);
    });
});

test("errors thrown whilst checking if a token is revoked are handled", async () => {
  const auth = authHeader({ role: "teamEditor" });

  // Throw an error whilst calling IsTokenRevoked query
  queryMock.mockQuery({
    name: "IsTokenRevoked",
    graphqlErrors: [{ message: "Something went wrong with Hasura" }],
    data: {},
    matchOnVariables: false,
  });

  await supertest(app)
    .post(ENDPOINT)
    .set(auth)
    .expect(500)
    .then((res) => {
      const error = JSON.stringify(res.error);

      expect(error).toMatch(/Failed to check if token is already revoked/);

      // Don't log potentially sensitive information
      expect(error).not.toMatch(/Something went wrong with Hasura/);
    });
});

test("revoked tokens cannot get re-revoked", async () => {
  const auth = authHeader({ role: "teamEditor" });

  // Mock an already revoked token
  queryMock.mockQuery({
    name: "IsTokenRevoked",
    matchOnVariables: false,
    data: {
      revokedToken: {
        revokedAt: Date.now(),
      },
    },
  });

  await supertest(app)
    .post(ENDPOINT)
    .set(auth)
    .expect(401)
    .then((res) => expect(res.text).toMatch(/The token has been revoked/));
});

test("errors thrown whilst revoking a token are handled", async () => {
  const auth = authHeader({ role: "teamEditor" });

  // Mock a token which is not yet revoked
  queryMock.mockQuery({
    name: "IsTokenRevoked",
    matchOnVariables: false,
    data: {
      revokedToken: {
        revokedAt: null,
      },
    },
  });

  queryMock.mockQuery({
    name: "RevokeToken",
    graphqlErrors: [{ message: "Something went wrong with Hasura" }],
    data: {},
    matchOnVariables: false,
  });

  await supertest(app)
    .post(ENDPOINT)
    .set(auth)
    .expect(500)
    .then((res) => {
      const error = JSON.stringify(res.error);

      expect(error).toMatch(/Failed to logout successfully/);
      expect(error).toMatch(/Failed to add token to revoked list/);

      // Don't log potentially sensitive information
      expect(error).not.toMatch(/Something went wrong with Hasura/);
    });
});

test("valid tokens will be written to the revoked_tokens table", async () => {
  const auth = authHeader({ role: "teamEditor" });

  // Mock a token which is not yet revoked
  queryMock.mockQuery({
    name: "IsTokenRevoked",
    matchOnVariables: false,
    data: {
      revokedToken: {
        revokedAt: null,
      },
    },
  });

  // Insert revoked_tokens record
  queryMock.mockQuery({
    name: "RevokeToken",
    matchOnVariables: false,
    data: {
      insertRevokedTokensOne: {
        revokedAt: Date.now(),
      },
    },
  });

  // Success
  await supertest(app).post(ENDPOINT).set(auth).expect(200);
});

// Awaiting implementation
test.todo("revoked tokens cannot access the REST API");
test.todo("revoked tokens cannot access the GraphQL API");
