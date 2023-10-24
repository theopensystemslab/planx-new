import supertest from "supertest";
import app from "../../server";
import { authHeader } from "../../tests/mockJWT";

const endpoint = (strings: TemplateStringsArray) =>
  `/admin/session/${strings[0]}/xml`;

const mockGenerateOneAppXML = jest
  .fn()
  .mockResolvedValue("<dummy:xml></dummy:xml>");

jest.mock("../../client", () => {
  return {
    $api: {
      export: {
        oneAppPayload: () => mockGenerateOneAppXML(),
      },
    },
  };
});

describe("OneApp XML endpoint", () => {
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

  it("returns XML", async () => {
    await supertest(app)
      .get(endpoint`123`)
      .set(authHeader({ role: "platformAdmin" }))
      .expect(200)
      .expect("content-type", "text/xml; charset=utf-8")
      .then((res) => {
        expect(res.text).toBe("<dummy:xml></dummy:xml>");
      });
  });
});
