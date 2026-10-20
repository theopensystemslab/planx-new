import supertest from "supertest";
import { v4 as uuidV4 } from "uuid";

import app from "../../../../server.js";
import { queryMock } from "../../../../tests/graphqlQueryMock.js";
import { authHeader } from "../../../../tests/mockJWT.js";
import {
  buildSubmissionExportZip,
  type ExportZip,
} from "../../utils/exportZip.js";

vi.mock("../../utils/exportZip.js", () => ({
  buildSubmissionExportZip: vi.fn(),
}));

const mockRemove = vi.fn();

const mockSession = () =>
  queryMock.mockQuery({
    name: "GetSessionById",
    matchOnVariables: false,
    data: {
      lowcal_sessions_by_pk: {
        id: 123,
        data: {
          id: "cc1a89cb-c552-4a52-a3b5-5a32ecadf18e",
          passport: {},
          sessionId: "56841432-b654-4d64-ab54-5d23d007a034",
          breadcrumbs: {},
        },
        flow: {
          id: "cc1a89cb-c552-4a52-a3b5-5a32ecadf18e",
          slug: "request-a-building-control-quote",
          name: "Request a building control quote",
        },
      },
    },
  });

beforeEach(() => {
  vi.mocked(buildSubmissionExportZip).mockResolvedValue({
    filename: "test.zip",
    toBuffer: () => Buffer.from("zip"),
    remove: mockRemove,
  } as unknown as ExportZip);
});

describe("getting an application by ID", () => {
  it("fails without authorization header", async () => {
    await supertest(app).get(`/submission/${uuidV4()}/zip`).expect(401);
  });

  it("errors if the sessionId is invalid", async () => {
    await supertest(app)
      .get(`/submission/not-a-uuid/zip`)
      .set(authHeader({ role: "teamEditor" }))
      .expect(400)
      .then((res) => {
        expect(res.body).toHaveProperty("issues");
        expect(res.body).toHaveProperty("name", "ZodError");
      });
  });

  it("returns an error for a missing / invalid session id", async () => {
    queryMock.mockQuery({
      name: "GetSessionById",
      matchOnVariables: false,
      data: {
        // No session found, or user does not have permission
        lowcal_sessions_by_pk: null,
      },
    });

    await supertest(app)
      .get(`/submission/${uuidV4()}/zip`)
      .set(authHeader({ role: "teamEditor" }))
      .expect(500)
      .then((res) => expect(res.body.error).toMatch(/Unable to find session/));
  });

  it("returns an error for if zip generation fails", async () => {
    mockSession();
    vi.mocked(buildSubmissionExportZip).mockRejectedValueOnce(
      new Error("Zip generation failed!"),
    );

    await supertest(app)
      .get(`/submission/56841432-b654-4d64-ab54-5d23d007a034/zip`)
      .set(authHeader({ role: "teamEditor" }))
      .expect(500)
      .then((res) =>
        expect(res.body.error).toBe(
          "Failed to download submission zip: Zip generation failed!",
        ),
      );
  });

  it("returns a zip buffer on success", async () => {
    mockSession();

    await supertest(app)
      .get(`/submission/56841432-b654-4d64-ab54-5d23d007a034/zip`)
      .set(authHeader({ role: "platformAdmin" }))
      .expect(200)
      .expect("content-type", "application/octet-stream")
      .then((res) => {
        expect(res.headers["content-disposition"]).toBe(
          "attachment; filename=test.zip",
        );
      });

    expect(buildSubmissionExportZip).toHaveBeenCalledWith({
      sessionId: "56841432-b654-4d64-ab54-5d23d007a034",
      includeDigitalPlanningJSON: true,
    });
    expect(mockRemove).toHaveBeenCalled();
  });
});
