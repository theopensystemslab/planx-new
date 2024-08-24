import supertest from "supertest";
import app from "../../../server.js";
import { expectedPlanningPermissionPayload } from "../../../tests/mocks/digitalPlanningDataMocks.js";
import { queryMock } from "../../../tests/graphqlQueryMock.js";

vi.mock("../../saveAndReturn/service/utils", () => ({
  markSessionAsSubmitted: vi.fn(),
}));

vi.mock("@opensystemslab/planx-core", async (importOriginal) => {
  const actualCore =
    await importOriginal<typeof import("@opensystemslab/planx-core")>();
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

describe(`uploading an application to S3`, () => {
  beforeEach(() => {
    queryMock.mockQuery({
      name: "GetStagingIntegrations",
      data: {
        teams: [
          {
            integrations: {
              powerAutomateWebhookURL: "test.azure.com/whatever",
              powerAutomateAPIKey: "secret",
            },
          },
        ],
      },
      variables: {
        slug: "barnet",
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

    queryMock.mockQuery({
      name: "CreateS3Application",
      matchOnVariables: false,
      data: {
        insertS3Application: { id: 1 },
      },
    });
  });

  it("requires auth", async () => {
    await supertest(app)
      .post("/upload-submission/barnet")
      .send({ payload: { sessionId: "123" } })
      .expect(401);
  });

  it("throws an error if payload is missing", async () => {
    await supertest(app)
      .post("/upload-submission/barnet")
      .set({ Authorization: process.env.HASURA_PLANX_API_KEY! })
      .send({ payload: null })
      .expect(400)
      .then((res) => {
        expect(res.body.error).toMatch(/Missing application payload/);
      });
  });

  it("throws an error if team is unsupported", async () => {
    await supertest(app)
      .post("/upload-submission/unsupported-team")
      .set({ Authorization: process.env.HASURA_PLANX_API_KEY! })
      .send({ payload: { sessionId: "123" } })
      .expect(500)
      .then((res) => {
        expect(res.body.error).toMatch(
          /No team matching "unsupported-team" found/,
        );
      });
  });

  it.todo("succeeds"); // mock uploadPrivateFile ??
});
