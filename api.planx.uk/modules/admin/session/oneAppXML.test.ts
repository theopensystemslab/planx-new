import supertest from "supertest";
import app from "../../../server.js";
import { authHeader } from "../../../tests/mockJWT.js";

const endpoint = (strings: TemplateStringsArray) =>
  `/admin/session/${strings[0]}/xml`;

const mockGenerateOneAppXML = jest
  .fn()
  .mockResolvedValue("<dummy:xml></dummy:xml>");

jest.mock("../../../client", () => {
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

  it("returns an error if the XML generation fails", async () => {
    mockGenerateOneAppXML.mockRejectedValueOnce("Error!");

    await supertest(app)
      .get(endpoint`123`)
      .set(authHeader({ role: "platformAdmin" }))
      .expect(500)
      .then((res) => {
        expect(res.body.error).toMatch(/Failed to get OneApp XML/);
      });
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
