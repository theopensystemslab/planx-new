import supertest from "supertest";
import app from "../../server";
import { authHeader, getJWT } from "../../tests/mockJWT";
import { userContext } from "../auth/middleware";

const getStoreMock = jest.spyOn(userContext, "getStore");

const mockUser = {
  firstName: "Bilbo",
  lastName: "Baggins",
  email: "bilbo.baggins@example.com",
  isPlatformAdmin: false,
};

const mockCreateUser = jest.fn();
const mockDeleteUser = jest.fn();
const mockGetByEmail = jest.fn().mockResolvedValue(mockUser);
const mockGetById = jest.fn().mockResolvedValue({
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

jest.mock("@opensystemslab/planx-core", () => {
  return {
    CoreDomainClient: jest.fn().mockImplementation(() => ({
      user: {
        create: () => mockCreateUser(),
        delete: () => mockDeleteUser(),
        getByEmail: () => mockGetByEmail(),
        getById: () => mockGetById(),
      },
    })),
  };
});

const auth = authHeader({ role: "platformAdmin" });

describe("Create user endpoint", () => {
  it("requires authentication", async () => {
    await supertest(app).put("/user").send(mockUser).expect(401);
  });

  it("requires the 'platformAdmin' role", async () => {
    await supertest(app)
      .put("/user")
      .set(authHeader({ role: "teamEditor" }))
      .send(mockUser)
      .expect(403);
  });

  it("handles Hasura / DB errors", async () => {
    mockCreateUser.mockRejectedValue(new Error("Something went wrong"));

    await supertest(app)
      .put("/user")
      .set(auth)
      .send(mockUser)
      .expect(500)
      .then((res) => {
        expect(mockCreateUser).toHaveBeenCalled();
        expect(res.body).toHaveProperty("error");
        expect(res.body.error).toMatch(/Failed to create user/);
      });
  });

  it("can successfully create a user", async () => {
    mockCreateUser.mockResolvedValue(123);

    await supertest(app)
      .put("/user")
      .set(auth)
      .send(mockUser)
      .expect(200)
      .then((res) => {
        expect(mockCreateUser).toHaveBeenCalled();
        expect(res.body).toHaveProperty("message");
        expect(res.body.message).toMatch(/Successfully created user/);
      });
  });
});

describe("Delete user endpoint", () => {
  it("requires authentication", async () => {
    await supertest(app).delete("/user/bilbo.baggins@example.com").expect(401);
  });

  it("requires the 'platformAdmin' role", async () => {
    await supertest(app)
      .delete("/user/bilbo.baggins@example.com")
      .set(authHeader({ role: "teamEditor" }))
      .expect(403);
  });

  it("handles an invalid email", async () => {
    mockGetByEmail.mockResolvedValueOnce(null);

    await supertest(app)
      .delete("/user/bilbo.baggins@example.com")
      .set(auth)
      .expect(500)
      .then((res) => {
        expect(mockGetByEmail).toHaveBeenCalled();
        expect(res.body).toHaveProperty("error");
        expect(res.body.error).toMatch(/Failed to delete user/);
      });
  });

  it("handles a failure to delete the user", async () => {
    mockDeleteUser.mockResolvedValueOnce(false);

    await supertest(app)
      .delete("/user/bilbo.baggins@example.com")
      .set(auth)
      .expect(500)
      .then((res) => {
        expect(mockGetByEmail).toHaveBeenCalled();
        expect(mockDeleteUser).toHaveBeenCalled();
        expect(res.body).toHaveProperty("error");
        expect(res.body.error).toMatch(/Failed to delete user/);
      });
  });

  it("can successfully delete a user", async () => {
    mockDeleteUser.mockResolvedValue(true);

    await supertest(app)
      .delete("/user/bilbo.baggins@example.com")
      .set(auth)
      .expect(200)
      .then((res) => {
        expect(mockGetByEmail).toHaveBeenCalled();
        expect(mockDeleteUser).toHaveBeenCalled();
        expect(res.body).toHaveProperty("message");
        expect(res.body.message).toMatch(/Successfully deleted user/);
      });
  });
});

describe("/me endpoint", () => {
  beforeEach(() => {
    getStoreMock.mockReturnValue({
      user: {
        sub: "123",
        jwt: getJWT({ role: "teamEditor" }),
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
        jwt: getJWT({ role: "teamEditor" }),
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
