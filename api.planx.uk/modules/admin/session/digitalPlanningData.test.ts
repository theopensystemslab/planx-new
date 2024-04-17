import supertest from "supertest";
import app from "../../../server";
import { authHeader } from "../../../tests/mockJWT";
import { expectedPlanningPermissionPayload } from "../../../tests/mocks/digitalPlanningDataMocks";

const endpoint = (strings: TemplateStringsArray) =>
  `/admin/session/${strings[0]}/digital-planning-application`;

const mockGenerateDigitalPlanningApplicationPayload = jest
  .fn()
  .mockResolvedValue(expectedPlanningPermissionPayload);

jest.mock("@opensystemslab/planx-core", () => {
  return {
    CoreDomainClient: jest.fn().mockImplementation(() => ({
      export: {
        digitalPlanningDataPayload: () =>
          mockGenerateDigitalPlanningApplicationPayload(),
      },
    })),
  };
});

describe("Digital Planning Application payload admin endpoint", () => {
  it("requires a user to be logged in", async () => {
    await supertest(app)
      .get(endpoint`123`)
      .expect(401)
      .then((res) =>
        expect(res.body).toEqual({
          error: "No authorization token was found",
        }),
      );
  });

  it("requires a user to have the 'platformAdmin' role", async () => {
    await supertest(app)
      .get(endpoint`123`)
      .set(authHeader({ role: "teamEditor" }))
      .expect(403);
  });

  it("returns an error if the Digital Planning payload generation fails", async () => {
    mockGenerateDigitalPlanningApplicationPayload.mockRejectedValueOnce(
      "Error!",
    );

    await supertest(app)
      .get(endpoint`123`)
      .set(authHeader({ role: "platformAdmin" }))
      .expect(500)
      .then((res) => {
        expect(res.body.error).toMatch(
          /Failed to make Digital Planning Application payload/,
        );
      });
  });

  it("returns a valid JSON payload", async () => {
    await supertest(app)
      .get(endpoint`123`)
      .set(authHeader({ role: "platformAdmin" }))
      .expect(200)
      .expect("content-type", "application/json; charset=utf-8")
      .then((res) =>
        expect(res.body).toEqual(expectedPlanningPermissionPayload),
      );
  });

  it("returns an invalid JSON payload if the skipValidation query param is set", async () => {
    await supertest(app)
      .get(endpoint`123`.concat("?skipValidation=true"))
      .set(authHeader({ role: "platformAdmin" }))
      .expect(200)
      .expect("content-type", "application/json; charset=utf-8")
      .then((res) =>
        expect(res.body).toEqual(expectedPlanningPermissionPayload),
      );
  });
});
