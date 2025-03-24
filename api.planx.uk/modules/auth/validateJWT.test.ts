import supertest from "supertest";
import app from "../../server.js";
import { authHeader, getTestJWT } from "../../tests/mockJWT.js";
import { queryMock } from "../../tests/graphqlQueryMock.js";

const mockRevokedToken = () => {
  queryMock.mockQuery({
    name: "IsTokenRevoked",
    matchOnVariables: false,
    data: {
      revokedToken: {
        revokedAt: Date.now(),
      },
    },
  });
};

describe("JWT in auth header", async () => {
  test("valid JWT", async () => {
    const authHeaderJWT = authHeader({ role: "platformAdmin" });

    await supertest(app)
      .get("/auth/validate-jwt")
      .set(authHeaderJWT)
      .expect(200);
  });

  test("revoked JWT", async () => {
    const authHeaderJWT = authHeader({ role: "platformAdmin" });

    mockRevokedToken();

    await supertest(app)
      .get("/auth/validate-jwt")
      .set(authHeaderJWT)
      .expect(401);
  });

  test("invalid JWT", async () => {
    await supertest(app)
      .get("/auth/validate-jwt")
      .set({ authorization: "Bearer NOT_A_JWT" })
      .expect(401);
  });
});

describe("JWT in cookie", () => {
  test("valid JWT", async () => {
    const jwt = getTestJWT({ role: "teamEditor" });

    await supertest(app)
      .get("/auth/validate-jwt")
      .set("Cookie", `jwt=${jwt}`)
      .expect(200);
  });

  test("revoked JWT", async () => {
    const jwt = getTestJWT({ role: "teamEditor" });

    mockRevokedToken();

    await supertest(app)
      .get("/auth/validate-jwt")
      .set("Cookie", `jwt=${jwt}`)
      .expect(401);
  });

  test("invalid JWT", async () => {
    await supertest(app)
      .get("/auth/validate-jwt")
      .set("Cookie", `jwt=NOT_A_JWT`)
      .expect(401);
  });
});

describe("JWT in query params", () => {
  test("valid JWT", async () => {
    const jwt = getTestJWT({ role: "teamEditor" });

    await supertest(app).get(`/auth/validate-jwt?token=${jwt}`).expect(200);
  });

  test("revoked JWT", async () => {
    const jwt = getTestJWT({ role: "teamEditor" });

    mockRevokedToken();

    await supertest(app).get(`/auth/validate-jwt?token=${jwt}`).expect(401);
  });

  test("invalid JWT", async () => {
    await supertest(app).get(`/auth/validate-jwt?token=NOT_A_JWT`).expect(401);
  });
});

test("no JWT", async () => {
  await supertest(app).get("/auth/validate-jwt").expect(401);
});
