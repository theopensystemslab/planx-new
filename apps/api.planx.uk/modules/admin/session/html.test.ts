import supertest from "supertest";
import app from "../../../server.js";
import type * as planxCore from "@opensystemslab/planx-core";
import { authHeader } from "../../../tests/mockJWT.js";
import { queryMock } from "../../../tests/graphqlQueryMock.js";
import { expectedPlanningPermissionPayload } from "../../../tests/mocks/digitalPlanningDataMocks.js";

const endpoint = (strings: TemplateStringsArray) =>
  `/admin/session/${strings[0]}/html`;

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

describe("HTML data admin endpoint", () => {
  it("requires a user to be logged in", async () => {
    return supertest(app)
      .get(endpoint`123`)
      .expect(401)
      .then((res) =>
        expect(res.body).toEqual({
          error: "No authorization token was found",
        }),
      );
  });

  it("requires a user to have the 'platformAdmin' role", async () => {
    return supertest(app)
      .get(endpoint`123`)
      .set(authHeader({ role: "teamViewer" }))
      .expect(403);
  });

  it("returns a HTML-formatted payload", async () => {
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

    return supertest(app)
      .get(endpoint`123`)
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
