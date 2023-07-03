import supertest from "supertest";
import app from "../../server";
import { authHeader } from "../../tests/mockJWT";
import { expectedPayload } from "../../tests/mocks/bopsMocks";

const endpoint = (strings: TemplateStringsArray) =>
  `/admin/session/${strings[0]}/bops`;

const mockGenerateBOPSPayload = jest.fn().mockResolvedValue(expectedPayload);

jest.mock("@opensystemslab/planx-core", () => {
  return {
    CoreDomainClient: jest.fn().mockImplementation(() => ({
      export: {
        bopsPayload: () => mockGenerateBOPSPayload(),
      },
    })),
  };
});

describe("BOPS payload admin endpoint", () => {
  it("requires a user to be logged in", async () => {
    await supertest(app)
      .get(endpoint`123`)
      .expect(401)
      .then((res) =>
        expect(res.body).toEqual({
          error: "No authorization token was found",
        })
      );
  });

  it("returns a JSON payload", async () => {
    await supertest(app)
      .get(endpoint`123`)
      .set(authHeader())
      .expect(200)
      .expect("content-type", "application/json; charset=utf-8")
      .then((res) => expect(res.body).toEqual(expectedPayload));
  });
});
