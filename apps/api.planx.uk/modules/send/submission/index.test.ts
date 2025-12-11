import supertest from "supertest";
import app from "../../../server.js";
import { v4 as uuidV4 } from "uuid";
import { authHeader } from "../../../tests/mockJWT.js";
import type * as planxCore from "@opensystemslab/planx-core";
import { expectedPlanningPermissionPayload } from "../../../tests/mocks/digitalPlanningDataMocks.js";
import { queryMock } from "../../../tests/graphqlQueryMock.js";

const mockGenerateHTMLData = vi
  .fn()
  .mockResolvedValue(expectedPlanningPermissionPayload);

vi.mock("@opensystemslab/planx-core", async (importOriginal) => {
  const originalModule = await importOriginal<typeof planxCore>();

  return {
    ...originalModule,
    CoreDomainClient: class extends originalModule.CoreDomainClient {
      constructor() {
        super();
        this.export.digitalPlanningDataPayload = () => mockGenerateHTMLData();
      }
    },
  };
});

describe("getting an application by ID", () => {
  it("fails without authorization header", async () => {
    await supertest(app).get(`/submission/${uuidV4()}/html`).expect(401);
  });

  it("errors if the sessionId is invalid", async () => {
    await supertest(app)
      .get(`/submission/not-a-uuid/html`)
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
      .get(`/submission/${uuidV4()}/html`)
      .set(authHeader({ role: "teamEditor" }))
      .expect(500)
      .then((res) => expect(res.body.error).toMatch(/Unable to find session/));
  });

  it("returns an error for if HTML generation fails", async () => {
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

    mockGenerateHTMLData.mockRejectedValueOnce(
      new Error("HTML generation failed!"),
    );

    await supertest(app)
      .get(`/submission/${uuidV4()}/html`)
      .set(authHeader({ role: "teamEditor" }))
      .expect(500)
      .then((res) => expect(res.body.error).toMatch(/Failed to build HTML/));
  });

  it("returns a HTML string on success", async () => {
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

    await supertest(app)
      .get(`/submission/${uuidV4()}/html`)
      .set(authHeader({ role: "platformAdmin" }))
      .expect(200)
      .expect("content-type", "text/html; charset=utf-8")

      .then((res) => {
        // HTML response returned
        expect(res.headers["content-type"]).toMatch(/text\/html/);
        expect(res).toHaveProperty("text");

        // Expected HTML document
        expect(res.text).toMatch(/^<html>.*<\/html>$/s);
        expect(res.text).toMatch(/Planning Permission/);
      });
  });
});
