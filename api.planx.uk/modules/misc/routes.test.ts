import supertest from "supertest";
import app from "../../server";
import { authHeader, getJWT } from "../../tests/mockJWT";
import { userContext } from "../auth/middleware";

const getStoreMock = jest.spyOn(userContext, "getStore");

const mockGetByEmail = jest.fn().mockResolvedValue({
  id: 36,
  firstName: "Albert",
  lastName: "Einstein",
  email: "albert@princeton.edu",
  isPlatformAdmin: true,
  teams: [
    {
      teamId: 1,
      role: "teamEditor"
    },
    {
      teamId: 24,
      role: "teamEditor"
    }
  ]
});

jest.mock("@opensystemslab/planx-core", () => {
  return {
    CoreDomainClient: jest.fn().mockImplementation(() => ({
      user: {
        getByEmail: () => mockGetByEmail(),
      }
    }))
  }
});

describe("/me endpoint", () => {
  beforeEach(() => {
    getStoreMock.mockReturnValue({
      user: {
        sub: "123",
        email: "test@opensystemslab.io",
        jwt: getJWT({ role: "teamEditor" })
      }
    });
  });

  it("returns an error if authorization headers are not set", async () => {
    await supertest(app)
      .get("/me")
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
        sub: "123",
        email: undefined,
        jwt: getJWT({ role: "teamEditor" })
      }
    });

    await supertest(app)
      .get("/me")
      .set(authHeader({ role: "teamEditor" }))
      .expect(400)
      .then((res) => {
        expect(res.body).toEqual({
          error: "User email missing from request",
        });
      });
  });

  it("returns an error for an invalid email address", async () => {
    mockGetByEmail.mockResolvedValueOnce(null)

    await supertest(app)
      .get("/me")
      .set(authHeader({ role: "teamEditor" }))
      .expect(400)
      .then((res) => {
        expect(res.body).toEqual({
          error: "Unable to locate user with email test@opensystemslab.io",
        });
      });
  });


  it("returns user details for a logged in user", async () => {
    await supertest(app)
      .get("/me")
      .set(authHeader({ role: "teamEditor" }))
      .expect(200)
      .then((res) => {
        expect(res.body).toHaveProperty("email", "albert@princeton.edu");
        expect(res.body.teams).toHaveLength(2);
      });
  });
});
