import supertest from "supertest";
import app from "../../server";
import { authHeader } from "../../tests/mockJWT";

jest.mock("../../send/exportZip", () => ({
  buildSubmissionExportZip: jest.fn().mockResolvedValue({
    zipName: "test.zip",
  }),
}));

const endpoint = (strings: TemplateStringsArray) =>
  `/admin/session/${strings[0]}/zip`;

describe("zip data admin endpoint", () => {
  afterEach(() => jest.clearAllMocks());

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

  it("downloads a CSV file if a query parameter is passed", async () => {
    await supertest(app)
      .get(endpoint`123`)
      .set(authHeader())
      .expect(200)
      .expect("content-type", "application/zip");
  });
});
