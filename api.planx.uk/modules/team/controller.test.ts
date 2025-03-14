import supertest from "supertest";
import app from "../../server.js";
import { authHeader } from "../../tests/mockJWT.js";

const mockAddMember = vi.fn();
const mockRemoveMember = vi.fn();
const mockChangeMemberRole = vi.fn();

vi.mock("./service", () => ({
  addMember: () => mockAddMember(),
  changeMemberRole: () => mockChangeMemberRole(),
  removeMember: () => mockRemoveMember(),
}));

const auth = authHeader({ role: "platformAdmin" });

describe("Removing a user from a team", () => {
  it("requires authentication", async () => {
    await supertest(app)
      .delete("/team/council/remove-member")
      .send({
        userEmail: "newbie@council.gov",
      })
      .expect(401);
  });

  it("validates that userId is required", async () => {
    await supertest(app)
      .delete("/team/council/remove-member")
      .set(auth)
      .send({})
      .expect(400)
      .then((res) => {
        expect(res.body).toHaveProperty("issues");
        expect(res.body).toHaveProperty("name", "ZodError");
      });
  });

  it("handles an error thrown in the service", async () => {
    mockRemoveMember.mockRejectedValueOnce(
      "Something went wrong in the service",
    );

    await supertest(app)
      .delete("/team/council/remove-member")
      .set(auth)
      .send({
        userEmail: "newbie@council.gov",
      })
      .expect(500)
      .then((res) => {
        expect(mockRemoveMember).toHaveBeenCalled();
        expect(res.body).toHaveProperty("error");
        expect(res.body.error).toMatch(/Failed to remove member from team/);
      });
  });

  it("can successfully remove a team member", async () => {
    await supertest(app)
      .delete("/team/council/remove-member")
      .set(auth)
      .send({
        userEmail: "newbie@council.gov",
        role: "teamEditor",
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
      .patch("/team/council/change-member-role")
      .send({
        userEmail: "newbie@council.gov",
        role: "teamEditor",
      })
      .expect(401);
  });

  it("validates that userId is required", async () => {
    await supertest(app)
      .patch("/team/council/change-member-role")
      .set(auth)
      .send({
        role: "teamEditor",
      })
      .expect(400)
      .then((res) => {
        expect(res.body).toHaveProperty("issues");
        expect(res.body).toHaveProperty("name", "ZodError");
      });
  });

  it("validates that role is required", async () => {
    await supertest(app)
      .patch("/team/council/change-member-role")
      .set(auth)
      .send({
        userEmail: "newbie@council.gov",
      })
      .expect(400)
      .then((res) => {
        expect(res.body).toHaveProperty("issues");
        expect(res.body).toHaveProperty("name", "ZodError");
      });
  });

  it("validates that role is an accepted value", async () => {
    await supertest(app)
      .patch("/team/council/change-member-role")
      .set(auth)
      .send({
        userEmail: "newbie@council.gov",
        role: "professor",
      })
      .expect(400)
      .then((res) => {
        expect(res.body).toHaveProperty("issues");
        expect(res.body).toHaveProperty("name", "ZodError");
      });
  });

  it("handles an error thrown in the service", async () => {
    mockChangeMemberRole.mockRejectedValueOnce(
      "Something went wrong in the service",
    );

    await supertest(app)
      .patch("/team/council/change-member-role")
      .set(auth)
      .send({
        userEmail: "newbie@council.gov",
        role: "teamEditor",
      })
      .expect(500)
      .then((res) => {
        expect(mockChangeMemberRole).toHaveBeenCalled();
        expect(res.body).toHaveProperty("error");
        expect(res.body.error).toMatch(/Failed to change role/);
      });
  });

  it("can successfully change a user's role", async () => {
    await supertest(app)
      .patch("/team/council/change-member-role")
      .set(auth)
      .send({
        userEmail: "newbie@council.gov",
        role: "teamEditor",
      })
      .expect(200)
      .then((res) => {
        expect(mockChangeMemberRole).toHaveBeenCalled();
        expect(res.body).toHaveProperty("message");
        expect(res.body.message).toMatch(/Successfully changed role/);
      });
  });
});
