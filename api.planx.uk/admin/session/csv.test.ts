import supertest from "supertest";
import app from "../../server";
import { authHeader } from "../../tests/mockJWT";

const endpoint = (strings: TemplateStringsArray) =>
  `/admin/session/${strings[0]}/csv`;

const mockGenerateCSVData = jest
  .fn()
  .mockResolvedValue({
    exportData: [
      {
        question: "Is this a test?",
        responses: [{ value: "Yes" }],
        metadata: {},
      },
    ],
    redactedExportData: [],
  });
jest.mock("@opensystemslab/planx-core", () => {
  return {
    CoreDomainClient: jest.fn().mockImplementation(() => ({
      generateCSVData: () => mockGenerateCSVData(),
    })),
  };
});

describe("CSV data admin endpoint", () => {
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

  it("returns a CSV-formatted payload", async () => {
    await supertest(app)
      .get(endpoint`123`)
      .set(authHeader())
      .expect(200)
      .expect("content-type", "application/json; charset=utf-8")
      .then((res) =>
        expect(res.body).toEqual([
          {
            question: "Is this a test?",
            responses: [{ value: "Yes" }],
            metadata: {},
          },
        ])
      );
  });

  it("downloads a CSV file if a query parameter is passed", async () => {
    await supertest(app)
      .get(endpoint`123` + `?download=true`)
      .set(authHeader())
      .expect(200)
      .expect("content-type", "text/csv; charset=utf-8");
  });
});
