import supertest from "supertest";
import app from "../../../server.js";
import { authHeader } from "../../../tests/mockJWT.js";

vi.mock("../../send/utils/exportZip", () => ({
  buildSubmissionExportZip: vi.fn().mockResolvedValue({
    filename: "tests/mocks/test.zip",
    remove: vi.fn,
  }),
}));

const endpoint = (strings: TemplateStringsArray) =>
  `/admin/session/${strings[0]}/zip`;

describe("zip data admin endpoint", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

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

  it("downloads a zip file", async () => {
    await supertest(app)
      .get(endpoint`123`)
      .set(authHeader({ role: "platformAdmin" }))
      .expect(200)
      .expect("content-type", "application/zip");
  });

  it.todo("returns an error if the service fails");
});
