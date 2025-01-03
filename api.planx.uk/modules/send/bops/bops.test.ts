import nock from "nock";
import supertest from "supertest";
import type * as planxCore from "@opensystemslab/planx-core";
import { queryMock } from "../../../tests/graphqlQueryMock.js";
import app from "../../../server.js";
import { expectedPlanningPermissionPayload } from "../../../tests/mocks/digitalPlanningDataMocks.js";

vi.mock("../../saveAndReturn/service/utils", () => ({
  markSessionAsSubmitted: vi.fn(),
}));

vi.mock("@opensystemslab/planx-core", async (importOriginal) => {
  const actualCore = await importOriginal<typeof planxCore>();
  const actualCoreDomainClient = actualCore.CoreDomainClient;

  return {
    CoreDomainClient: class extends actualCoreDomainClient {
      constructor() {
        super();
        this.export.digitalPlanningDataPayload = async () =>
          vi.fn().mockResolvedValue({
            exportData: expectedPlanningPermissionPayload,
          });
      }
    },
  };
});

describe(`sending an application to BOPS (v2)`, () => {
  const submissionURL =
    "https://test.bops-test.com/api/v2/planning_applications";

  beforeEach(() => {
    queryMock.mockQuery({
      name: "FindApplication",
      data: {
        bopsApplications: [],
      },
      variables: {
        session_id: "37e3649b-4854-4249-a5c3-7937c1b952b9",
        search_string: "%/api/v2/planning_applications",
      },
    });

    queryMock.mockQuery({
      name: "CreateBopsApplication",
      matchOnVariables: false,
      data: {
        insertBopsApplication: { id: 22 },
      },
    });

    queryMock.mockQuery({
      name: "GetStagingIntegrations",
      data: {
        teams: [
          {
            integrations: {
              bopsSubmissionURL: submissionURL,
              // Decodes to "abc123"
              bopsSecret:
                "668514b455572ca39c46e49396506b29:6c6df14c7fd405dbf380533ba0dcae39",
            },
          },
        ],
      },
      variables: {
        slug: "southwark",
      },
    });

    queryMock.mockQuery({
      name: "GetStagingIntegrations",
      data: {
        teams: [],
      },
      variables: {
        slug: "unsupported-team",
      },
    });
  });

  it("successfully proxies request and returns hasura id", async () => {
    const expectedHeaders = { authorization: "Bearer abc123" };
    const nockScope = nock(submissionURL, {
      reqheaders: expectedHeaders,
    })
      .post("")
      .reply(200, {
        application: "0000123",
      });

    await supertest(app)
      .post("/bops/southwark")
      .set({ Authorization: process.env.HASURA_PLANX_API_KEY! })
      .send({ payload: { sessionId: "37e3649b-4854-4249-a5c3-7937c1b952b9" } })
      .expect(200)
      .then((res) => {
        expect(res.body).toEqual({
          application: { id: 22, bopsResponse: { application: "0000123" } },
        });

        // Check nock was called with expected headers
        expect(nockScope.isDone()).toBe(true);
      });
  });

  it("requires auth", async () => {
    await supertest(app)
      .post("/bops/southwark")
      .send({ payload: { sessionId: "37e3649b-4854-4249-a5c3-7937c1b952b9" } })
      .expect(401);
  });

  it("throws an error if payload is missing", async () => {
    await supertest(app)
      .post("/bops/southwark")
      .set({ Authorization: process.env.HASURA_PLANX_API_KEY! })
      .send({ payload: null })
      .expect(400)
      .then((res) => {
        expect(res.body).toHaveProperty("issues");
        expect(res.body).toHaveProperty("name", "ZodError");
      });
  });

  it("throws an error if team is unsupported", async () => {
    await supertest(app)
      .post("/bops/unsupported-team")
      .set({ Authorization: process.env.HASURA_PLANX_API_KEY! })
      .send({ payload: { sessionId: "37e3649b-4854-4249-a5c3-7937c1b952b9" } })
      .expect(500)
      .then((res) => {
        expect(res.body.error).toMatch(
          /No team matching "unsupported-team" found/,
        );
      });
  });

  it("does not re-send an application which has already been submitted", async () => {
    const previouslySubmittedApplicationID =
      "07e4dd0d-ec3c-48f5-adc7-aee90116f6c7";

    queryMock.mockQuery({
      name: "FindApplication",
      data: {
        bopsApplications: [
          { response: { message: "Application created", id: "bops_app_id" } },
        ],
      },
      variables: {
        session_id: previouslySubmittedApplicationID,
        search_string: "%/api/v2/planning_applications",
      },
    });

    await supertest(app)
      .post("/bops/southwark")
      .set({ Authorization: process.env.HASURA_PLANX_API_KEY! })
      .send({ payload: { sessionId: previouslySubmittedApplicationID } })
      .expect(200)
      .then((res) => {
        expect(res.body).toEqual({
          sessionId: previouslySubmittedApplicationID,
          bopsId: "bops_app_id",
          message: "Skipping send, already successfully submitted",
        });
      });
  });
});
