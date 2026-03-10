import supertest from "supertest";
import type * as planxCore from "@opensystemslab/planx-core";
import { queryMock } from "../../../tests/graphqlQueryMock.js";
import app from "../../../server.js";

vi.mock("@opensystemslab/planx-core", async () => {
  const actualCore = await vi.importActual<typeof planxCore>(
    "@opensystemslab/planx-core",
  );
  const mockPassport = class MockPassport {
    files = vi.fn().mockImplementation(() => []);
  };

  return {
    ...actualCore,
    Passport: mockPassport,
  };
});

const mockBuildSubmissionExportZip = vi.fn().mockImplementation(() => ({
  write: () => "zip",
  toBuffer: () => Buffer.from("test"),
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  remove: () => {},
}));

vi.mock("../utils/exportZip", () => {
  return {
    buildSubmissionExportZip: (input: string) =>
      Promise.resolve(mockBuildSubmissionExportZip(input)),
  };
});

describe("downloading application data with an access token", () => {
  describe("token validation", () => {
    it("fails without authorization header", async () => {
      await supertest(app)
        .get("/download-application")
        .expect(400)
        .then((res) =>
          expect(res.body.issues[0]).toHaveProperty(
            "message",
            "Authorization headers are required",
          ),
        );
    });

    it("fails without a correctly formatted authorization header", async () => {
      await supertest(app)
        .get("/download-application")
        .set({ authorization: "super secret!" })
        .expect(400)
        .then((res) =>
          expect(res.body.issues[0]).toHaveProperty(
            "message",
            "Invalid token format",
          ),
        );
    });

    it("errors if matching token is not found", async () => {
      queryMock.mockQuery({
        name: "GetApplicationAccessToken",
        matchOnVariables: true,
        data: {
          record: null,
        },
        variables: { token: "1aa3b03e-3071-438e-9ac7-0f9f6449f164" },
      });

      await supertest(app)
        .get("/download-application")
        .set({ authorization: "Bearer 1aa3b03e-3071-438e-9ac7-0f9f6449f164" })
        .expect(404)
        .then((res) => expect(res.body.error).toEqual("INVALID_ACCESS_TOKEN"));
    });

    it("errors if a token is revoked", async () => {
      queryMock.mockQuery({
        name: "GetApplicationAccessToken",
        matchOnVariables: true,
        data: {
          record: {
            revokedAt: "2026-03-10T10:23:55.233Z",
          },
        },
        variables: { token: "1aa3b03e-3071-438e-9ac7-0f9f6449f164" },
      });

      await supertest(app)
        .get("/download-application")
        .set({ authorization: "Bearer 1aa3b03e-3071-438e-9ac7-0f9f6449f164" })
        .expect(410)
        .then((res) => expect(res.body.error).toEqual("REVOKED_ACCESS_TOKEN"));
    });

    it("errors if token is expired", async () => {
      queryMock.mockQuery({
        name: "GetApplicationAccessToken",
        matchOnVariables: true,
        data: {
          record: {
            expiresAt: "2000-01-01T10:23:55.233Z",
          },
        },
        variables: { token: "1aa3b03e-3071-438e-9ac7-0f9f6449f164" },
      });

      await supertest(app)
        .get("/download-application")
        .set({ authorization: "Bearer 1aa3b03e-3071-438e-9ac7-0f9f6449f164" })
        .expect(410)
        .then((res) => expect(res.body.error).toEqual("EXPIRED_ACCESS_TOKEN"));
    });
  });

  describe("payload generation", () => {
    // Setup mocks for a valid access token
    beforeEach(() => {
      queryMock.mockQuery({
        name: "GetApplicationAccessToken",
        matchOnVariables: true,
        data: {
          record: {
            expiresAt: "3000-01-01T10:23:55.233Z",
            revokedAt: null,
            sessionId: "9504429e-f18a-4d58-9a34-073823eec98a",
          },
        },
        variables: { token: "1aa3b03e-3071-438e-9ac7-0f9f6449f164" },
      });

      queryMock.mockQuery({
        name: "UseAccessToken",
        matchOnVariables: true,
        data: {
          update_application_access_tokens_by_pk: {
            access_count: 1,
            last_access_at: "2026-03-10T10:23:55.233Z",
          },
        },
        variables: { token: "1aa3b03e-3071-438e-9ac7-0f9f6449f164" },
      });
    });

    it("throws an error if zip generation fails", async () => {
      mockBuildSubmissionExportZip.mockImplementationOnce(() => {
        return Promise.reject(new Error("Failed to create zip"));
      });

      await supertest(app)
        .get("/download-application")
        .set({ authorization: "Bearer 1aa3b03e-3071-438e-9ac7-0f9f6449f164" })
        .expect(500)
        .then((res) => {
          expect(res.body.error).toMatch(
            /Failed to download application files/,
          );
          expect(res.body.error).toMatch(/Failed to create zip/);
        });
    });

    it("successfully downloads application files when all data is valid", async () => {
      await supertest(app)
        .get("/download-application")
        .set({ authorization: "Bearer 1aa3b03e-3071-438e-9ac7-0f9f6449f164" })
        .expect(200)
        .then((res) => {
          expect(res.headers["content-type"]).toBe("application/octet-stream");
          expect(res.headers["content-disposition"]).toMatch(
            /attachment; filename=/,
          );
          expect(res.body).toBeInstanceOf(Buffer);
        });
    });
  });
});
