import supertest from "supertest";
import app from "../../../server";
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
        this.export.digitalPlanningDataPayload = () =>
          jest.fn().mockResolvedValue({
            exportData: expectedPlanningPermissionPayload,
          });
      }
    },
  };
});

describe(`uploading an application to S3`, () => {
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
      .expect(400)
      .then((res) => {
        expect(res.body.error).toMatch(
          "Send to S3 is not enabled for this local authority (unsupported-team)",
        );
      });
  });

  it.todo("succeeds"); // mock uploadPrivateFile ??
});
