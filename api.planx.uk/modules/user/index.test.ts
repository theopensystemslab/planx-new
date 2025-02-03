import supertest from "supertest";
import app from "../../server.js";
import {
  authHeader,
  expiredAuthHeader,
  getTestJWT,
} from "../../tests/mockJWT.js";
import { userContext } from "../auth/middleware.js";

const getStoreMock = vi.spyOn(userContext, "getStore");

const mockGetById = vi.fn().mockResolvedValue({
  id: 123,
  firstName: "Albert",
  lastName: "Einstein",
  email: "albert@princeton.edu",
  isPlatformAdmin: true,
  teams: [
    {
      teamId: 1,
      role: "teamEditor",
    },
    {
      teamId: 24,
      role: "teamEditor",
    },
  ],
});

vi.mock("@opensystemslab/planx-core", () => {
  return {
    CoreDomainClient: vi.fn().mockImplementation(() => ({
      user: {
        getById: () => mockGetById(),
      },
    })),
  };
});

describe("/me endpoint", () => {
  beforeEach(() => {
    getStoreMock.mockReturnValue({
      user: {
        sub: "123",
        jwt: getTestJWT({ role: "teamEditor" }),
      },
    });
  });

  it("returns an error if authorization headers are not set", async () => {
    await supertest(app)
      .get("/user/me")
      .expect(401)
      .then((res) => {
        expect(res.body).toEqual({
          error: "No authorization token was found",
        });
      });
  });

  it("returns an error for invalid user context", async () => {
    getStoreMock.mockReturnValue({
      user: {
        sub: undefined,
        jwt: getTestJWT({ role: "teamEditor" }),
      },
    });

    await supertest(app)
      .get("/user/me")
      .set(authHeader({ role: "teamEditor" }))
      .expect(400)
      .then((res) => {
        expect(res.body).toEqual({
          error: "User ID missing from request",
        });
      });
  });

  it("returns an error for an invalid email address", async () => {
    mockGetById.mockResolvedValueOnce(null);

    await supertest(app)
      .get("/user/me")
      .set(authHeader({ role: "teamEditor" }))
      .expect(400)
      .then((res) => {
        expect(res.body).toEqual({
          error: "Unable to locate user with ID 123",
        });
      });
  });

  it("returns a redirect for an expired JWT", async () => {
    await supertest(app)
      .get("/user/me")
      .set(expiredAuthHeader({ role: "teamEditor" }))
      .expect(302)
      .then((res) => {
        expect(res.redirect).toBe(true);
        expect(res.header.location).toMatch(/logout/);
      });
  });

  it("returns user details for a logged in user", async () => {
    await supertest(app)
      .get("/user/me")
      .set(authHeader({ role: "teamEditor" }))
      .expect(200)
      .then((res) => {
        expect(res.body).toHaveProperty("email", "albert@princeton.edu");
        expect(res.body.teams).toHaveLength(2);
      });
  });
});
