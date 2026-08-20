import supertest from "supertest";

import app from "../../server.js";
import { queryMock } from "../../tests/graphqlQueryMock.js";
import {
  authHeader,
  expiredAuthHeader,
  getTestJWT,
} from "../../tests/mockJWT.js";

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
      .expect(200)
      .then((res) => {
        // Decoded JWT returned
        expect(res.body).toHaveProperty("sub", "123");
        expect(res.body).toHaveProperty("email", "test@opensystemslab.io");
      });
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

  test("expired JWT", async () => {
    await supertest(app)
      .get("/auth/validate-jwt")
      .set(expiredAuthHeader({ role: "platformAdmin" }))
      .expect(401);
  });
});

describe("JWT in cookie", () => {
  test("valid JWT", async () => {
    const jwt = getTestJWT({ role: "teamEditor" });

    await supertest(app)
      .get("/auth/validate-jwt")
      .set("Cookie", `jwt=${jwt}`)
      .expect(200)
      .then((res) => {
        // Decoded JWT returned
        expect(res.body).toHaveProperty("sub", "123");
        expect(res.body).toHaveProperty("email", "test@opensystemslab.io");
      });
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

  test("expired JWT", async () => {
    const jwt = getTestJWT({ role: "teamEditor", isExpired: true });

    await supertest(app)
      .get("/auth/validate-jwt")
      .set("Cookie", `jwt=${jwt}`)
      .expect(401);
  });
});

describe("JWT in query params", () => {
  test("valid JWT", async () => {
    const jwt = getTestJWT({ role: "teamEditor" });

    await supertest(app)
      .get(`/auth/validate-jwt?token=${jwt}`)
      .expect(200)
      .then((res) => {
        // Decoded JWT returned
        expect(res.body).toHaveProperty("sub", "123");
        expect(res.body).toHaveProperty("email", "test@opensystemslab.io");
      });
  });

  test("revoked JWT", async () => {
    const jwt = getTestJWT({ role: "teamEditor" });

    mockRevokedToken();

    await supertest(app).get(`/auth/validate-jwt?token=${jwt}`).expect(401);
  });

  test("invalid JWT", async () => {
    await supertest(app).get(`/auth/validate-jwt?token=NOT_A_JWT`).expect(401);
  });

  test("expired JWT", async () => {
    const jwt = getTestJWT({ role: "teamEditor", isExpired: true });

    await supertest(app).get(`/auth/validate-jwt?token=${jwt}`).expect(401);
  });
});

test("no JWT", async () => {
  await supertest(app).get("/auth/validate-jwt").expect(401);
});

describe("log levels", () => {
  test("expired JWT logs at debug level, not error", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const debugSpy = vi.spyOn(console, "debug").mockImplementation(() => {});

    await supertest(app)
      .get("/auth/validate-jwt")
      .set(expiredAuthHeader({ role: "platformAdmin" }))
      .expect(401);

    expect(errorSpy).not.toHaveBeenCalled();
    expect(debugSpy).toHaveBeenCalledWith(
      "JWT expired",
      expect.objectContaining({ expiredAt: expect.any(Date) }),
    );

    vi.restoreAllMocks();
  });

  test("revoked JWT logs at debug level, not error", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const debugSpy = vi.spyOn(console, "debug").mockImplementation(() => {});

    mockRevokedToken();

    await supertest(app)
      .get("/auth/validate-jwt")
      .set(authHeader({ role: "platformAdmin" }))
      .expect(401);

    expect(errorSpy).not.toHaveBeenCalled();
    expect(debugSpy).toHaveBeenCalledWith(
      "Token is revoked",
      expect.objectContaining({ tokenDigest: expect.any(String) }),
    );

    vi.restoreAllMocks();
  });

  test("invalid JWT logs at debug level, not error", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const debugSpy = vi.spyOn(console, "debug").mockImplementation(() => {});

    await supertest(app)
      .get("/auth/validate-jwt")
      .set({ authorization: "Bearer NOT_A_JWT" })
      .expect(401);

    expect(errorSpy).not.toHaveBeenCalled();
    expect(debugSpy).toHaveBeenCalledWith(
      "JWT validation failed",
      expect.objectContaining({ message: expect.any(String) }),
    );

    vi.restoreAllMocks();
  });
});
