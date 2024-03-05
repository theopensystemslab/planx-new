import nock from "nock";
import supertest from "supertest";
import { queryMock } from "../../../tests/graphqlQueryMock";
import app from "../../../server";
import { expectedPayload } from "../../../tests/mocks/bopsMocks";
import { expectedPlanningPermissionPayload } from "../../../tests/mocks/digitalPlanningDataMocks";

jest.mock("../../saveAndReturn/service/utils", () => ({
  markSessionAsSubmitted: jest.fn(),
}));

jest.mock("@opensystemslab/planx-core", () => {
  const actualCoreDomainClient = jest.requireActual(
    "@opensystemslab/planx-core",
  ).CoreDomainClient;

  return {
    CoreDomainClient: class extends actualCoreDomainClient {
      constructor() {
        super();
        this.export.bopsPayload = () =>
          jest.fn().mockResolvedValue({
            exportData: expectedPayload,
            redactedExportData: expectedPayload,
          });
        this.export.digitalPlanningDataPayload = () =>
          jest.fn().mockResolvedValue({
            exportData: expectedPlanningPermissionPayload,
          });
      }
    },
  };
});

describe(`sending an application to BOPS (v2)`, () => {
  const submissionURL = "https://test.bops-test.com";

  beforeEach(() => {
    queryMock.mockQuery({
      name: "FindApplication",
      data: {
        bopsApplications: [],
      },
      variables: {
        session_id: "123",
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
    const nockScope = nock(`${submissionURL}/api/v2/planning_applications`, {
      reqheaders: expectedHeaders,
    })
      .post("")
      .reply(200, {
        application: "0000123",
      });

    await supertest(app)
      .post("/bops/southwark")
      .set({ Authorization: process.env.HASURA_PLANX_API_KEY! })
      .send({ payload: { sessionId: "123" } })
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
      .send({ payload: { sessionId: "123" } })
      .expect(401);
  });

  it("throws an error if payload is missing", async () => {
    await supertest(app)
      .post("/bops/southwark")
      .set({ Authorization: process.env.HASURA_PLANX_API_KEY! })
      .send({ payload: null })
      .expect(400)
      .then((res) => {
        expect(res.body.error).toMatch(/Missing application/);
      });
  });

  it("throws an error if team is unsupported", async () => {
    await supertest(app)
      .post("/bops/unsupported-team")
      .set({ Authorization: process.env.HASURA_PLANX_API_KEY! })
      .send({ payload: { sessionId: "123" } })
      .expect(500)
      .then((res) => {
        expect(res.body.error).toMatch(
          /No team matching "unsupported-team" found/,
        );
      });
  });

  it("does not re-send an application which has already been submitted", async () => {
    queryMock.mockQuery({
      name: "FindApplication",
      data: {
        bopsApplications: [
          { response: { message: "Application created", id: "bops_app_id" } },
        ],
      },
      variables: {
        session_id: "previously_submitted_app",
        search_string: "%/api/v2/planning_applications",
      },
    });

    await supertest(app)
      .post("/bops/southwark")
      .set({ Authorization: process.env.HASURA_PLANX_API_KEY! })
      .send({ payload: { sessionId: "previously_submitted_app" } })
      .expect(200)
      .then((res) => {
        expect(res.body).toEqual({
          sessionId: "previously_submitted_app",
          bopsId: "bops_app_id",
          message: "Skipping send, already successfully submitted",
        });
      });
  });
});
