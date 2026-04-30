import supertest from "supertest";
import app from "../../../../server.js";
import { authHeader } from "../../../../tests/mockJWT.js";
import { queryMock } from "../../../../tests/graphqlQueryMock.js";

const ENDPOINT = "/auth/logout";

afterEach(() => queryMock.reset());

test("logout succeeds even without a JWT", async () => {
  await supertest(app).post(ENDPOINT).expect(200);
});

test("logout succeeds even if token revocation check fails", async () => {
  const auth = authHeader({ role: "teamEditor" });

  // Throw an error whilst calling IsTokenRevoked query
  queryMock.mockQuery({
    name: "IsTokenRevoked",
    graphqlErrors: [{ message: "Something went wrong with Hasura" }],
    data: {},
    matchOnVariables: false,
  });

  await supertest(app).post(ENDPOINT).set(auth).expect(200);
});

test("logout succeeds even if token is already revoked", async () => {
  const auth = authHeader({ role: "teamEditor" });

  queryMock.mockQuery({
    name: "IsTokenRevoked",
    matchOnVariables: false,
    data: {
      revokedToken: {
        revokedAt: Date.now(),
      },
    },
  });

  await supertest(app).post(ENDPOINT).set(auth).expect(200);
});

test("logout succeeds even if writing to revoked_tokens fails", async () => {
  const auth = authHeader({ role: "teamEditor" });

  queryMock.mockQuery({
    name: "IsTokenRevoked",
    matchOnVariables: false,
    data: {
      revokedToken: { revokedAt: null },
    },
  });

  queryMock.mockQuery({
    name: "RevokeToken",
    graphqlErrors: [{ message: "Something went wrong with Hasura" }],
    data: {},
    matchOnVariables: false,
  });

  await supertest(app).post(ENDPOINT).set(auth).expect(200);
});

test("valid tokens are written to the revoked_tokens table", async () => {
  const auth = authHeader({ role: "teamEditor" });

  queryMock.mockQuery({
    name: "IsTokenRevoked",
    matchOnVariables: false,
    data: { revokedToken: { revokedAt: null } },
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

test("cookies are cleared on logout regardless of token state", async () => {
  await supertest(app)
    .post(ENDPOINT)
    .expect(200)
    .then((res) => {
      const cookies = res.headers["set-cookie"] as unknown as string[];
      expect(cookies.some((c) => c.startsWith("jwt=;"))).toBe(true);
      expect(cookies.some((c) => c.startsWith("auth=;"))).toBe(true);
    });
});

test.todo("revoked tokens cannot access the REST API");
test.todo("revoked tokens cannot access the GraphQL API");
