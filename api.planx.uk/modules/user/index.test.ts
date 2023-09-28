import supertest from "supertest";
import app from "../../server";
import { authHeader } from "../../tests/mockJWT";

const mockCreateUser = jest.fn();

const mockUser = {
  firstName: "Bilbo",
  lastName: "Baggins",
  email: "bilbo@bagend.sh",
  isPlatformAdmin: false,
};

jest.mock("@opensystemslab/planx-core", () => {
  return {
    CoreDomainClient: jest.fn().mockImplementation(() => ({
      user: {
        create: () => mockCreateUser(),
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
