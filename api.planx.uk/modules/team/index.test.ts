import supertest from "supertest";
import app from "../../server";
import { authHeader } from "../../tests/mockJWT";

const mockAddMember = jest.fn();
const mockRemoveMember = jest.fn();
const mockChangeMemberRole = jest.fn();

jest.mock("@opensystemslab/planx-core", () => {
  return {
    CoreDomainClient: jest.fn().mockImplementation(() => ({
      team: {
        addMember: () => mockAddMember(),
        removeMember: () => mockRemoveMember(),
        changeMemberRole: () => mockChangeMemberRole(),
      },
    })),
  };
});

describe("Adding a user to a team", () => {
  it("requires authentication", async () => {
    await supertest(app)
      .put("/team/123/add-member")
      .send({
        userId: 123,
        role: "viewer",
      })
      .expect(401);
  });

  it("validates that userId is required", async () => {
    await supertest(app)
      .put("/team/123/add-member")
      .set(authHeader())
      .send({
        role: "viewer",
      })
      .expect(400)
      .then((res) => {
        expect(res.body).toHaveProperty("issues");
        expect(res.body).toHaveProperty("name", "ZodError");
      });
  });

  it("validates that role is required", async () => {
    await supertest(app)
      .put("/team/123/add-member")
      .set(authHeader())
      .send({
        userId: 123,
      })
      .expect(400)
      .then((res) => {
        expect(res.body).toHaveProperty("issues");
        expect(res.body).toHaveProperty("name", "ZodError");
      });
  });

  it("validates that role must one an accepted value", async () => {
    await supertest(app)
      .put("/team/123/add-member")
      .set(authHeader())
      .send({
        userId: 123,
        role: "pirate",
      })
      .expect(400)
      .then((res) => {
        expect(res.body).toHaveProperty("issues");
        expect(res.body).toHaveProperty("name", "ZodError");
      });
  });

  it("handles Hasura / DB errors", async () => {
    mockAddMember.mockResolvedValue(false);

    await supertest(app)
      .put("/team/123/add-member")
      .set(authHeader())
      .send({
        userId: 123,
        role: "admin",
      })
      .expect(500)
      .then((res) => {
        expect(mockAddMember).toHaveBeenCalled();
        expect(res.body).toHaveProperty("message");
        expect(res.body.message).toMatch(/Failed to add member to team/);
      });
  });

  it("can successfully add a team member", async () => {
    mockAddMember.mockResolvedValue(true);

    await supertest(app)
      .put("/team/123/add-member")
      .set(authHeader())
      .send({
        userId: 123,
        role: "admin",
      })
      .expect(200)
      .then((res) => {
        expect(mockAddMember).toHaveBeenCalled();
        expect(res.body).toHaveProperty("message");
        expect(res.body.message).toMatch(/Successfully added user to team/);
      });
  });
});

describe("Removing a user from a team", () => {
  it("requires authentication", async () => {
    await supertest(app)
      .delete("/team/123/remove-member")
      .send({
        userId: 123,
      })
      .expect(401);
  });

  it("validates that userId is required", async () => {
    await supertest(app)
      .delete("/team/123/remove-member")
      .set(authHeader())
      .send({})
      .expect(400)
      .then((res) => {
        expect(res.body).toHaveProperty("issues");
        expect(res.body).toHaveProperty("name", "ZodError");
      });
  });

  it("handles Hasura / DB errors", async () => {
    mockRemoveMember.mockResolvedValue(false);

    await supertest(app)
      .delete("/team/123/remove-member")
      .set(authHeader())
      .send({
        userId: 123,
      })
      .expect(500)
      .then((res) => {
        expect(mockRemoveMember).toHaveBeenCalled();
        expect(res.body).toHaveProperty("message");
        expect(res.body.message).toMatch(/Failed to remove member from team/);
      });
  });

  it("can successfully remove a team member", async () => {
    mockRemoveMember.mockResolvedValue(true);

    await supertest(app)
      .delete("/team/123/remove-member")
      .set(authHeader())
      .send({
        userId: 123,
        role: "admin",
      })
      .expect(200)
      .then((res) => {
        expect(mockRemoveMember).toHaveBeenCalled();
        expect(res.body).toHaveProperty("message");
        expect(res.body.message).toMatch(/Successfully removed user from team/);
      });
  });
});

describe("Changing a user's role", () => {
  it("requires authentication", async () => {
    await supertest(app)
      .patch("/team/123/change-member-role")
      .send({
        userId: 123,
        role: "admin",
      })
      .expect(401);
  });

  it("validates that userId is required", async () => {
    await supertest(app)
      .patch("/team/123/change-member-role")
      .set(authHeader())
      .send({
        role: "admin",
      })
      .expect(400)
      .then((res) => {
        expect(res.body).toHaveProperty("issues");
        expect(res.body).toHaveProperty("name", "ZodError");
      });
  });

  it("validates that role is required", async () => {
    await supertest(app)
      .patch("/team/123/change-member-role")
      .set(authHeader())
      .send({
        userId: 123,
      })
      .expect(400)
      .then((res) => {
        expect(res.body).toHaveProperty("issues");
        expect(res.body).toHaveProperty("name", "ZodError");
      });
  });

  it("validates that role is an accepted value", async () => {
    await supertest(app)
      .patch("/team/123/change-member-role")
      .set(authHeader())
      .send({
        userId: 123,
        role: "professor",
      })
      .expect(400)
      .then((res) => {
        expect(res.body).toHaveProperty("issues");
        expect(res.body).toHaveProperty("name", "ZodError");
      });
  });

  it("handles Hasura / DB errors", async () => {
    mockChangeMemberRole.mockResolvedValue(false);

    await supertest(app)
      .patch("/team/123/change-member-role")
      .set(authHeader())
      .send({
        userId: 123,
        role: "admin",
      })
      .expect(500)
      .then((res) => {
        expect(mockChangeMemberRole).toHaveBeenCalled();
        expect(res.body).toHaveProperty("message");
        expect(res.body.message).toMatch(/Failed to change role/);
      });
  });

  it("can successfully change a user's role", async () => {
    mockChangeMemberRole.mockResolvedValue(true);

    await supertest(app)
      .patch("/team/123/change-member-role")
      .set(authHeader())
      .send({
        userId: 123,
        role: "admin",
      })
      .expect(200)
      .then((res) => {
        expect(mockChangeMemberRole).toHaveBeenCalled();
        expect(res.body).toHaveProperty("message");
        expect(res.body.message).toMatch(/Successfully changed role/);
      });
  });
});
