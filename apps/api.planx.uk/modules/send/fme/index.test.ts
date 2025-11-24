import supertest from "supertest";
import app from "../../../server.js";
import { queryMock } from "../../../tests/graphqlQueryMock.js";

describe("Submissions endpoint", () => {
  beforeEach(() => {
    queryMock.mockQuery({
      name: "GetS3Applications",
      variables: {
        teamSlug: "camden",
        createdAt: "2025-10-27T01:46:23.358Z",
      },
      matchOnVariables: false,
      data: {
        submissions: [
          {
            id: 1,
            sessionId: "e6274dad-40ef-4e7a-b170-0c43ec8cfd9a",
            flowName: "Camden - Apply for a lawful development certificate",
            file: "http://localhost:7002/file/private/ocb61jk5/e6274dad-40ef-4e7a-b170-0c43ec8cfd9a.json",
            message: "New submission from PlanX",
            payloadType: "Validated ODP Schema",
            submittedAt: "2025-11-24T00:02:04.197753+00:00",
          },
        ],
      },
    });
  });

  it("requires authorisation header key", async () => {
    await supertest(app)
      .get(`/submissions/camden`)
      .expect(401)
      .then((res) =>
        expect(res.body).toEqual({
          error: "Unauthorised",
        }),
      );
  });

  it("return unauthorised for an invalid header key", async () => {
    await supertest(app)
      .get(`/submissions/camden`)
      .set({ "api-key": "INVALID" })
      .expect(401)
      .then((res) =>
        expect(res.body).toEqual({
          error: "Unauthorised",
        }),
      );
  });

  it("throws an error if a local authority param isn't present", async () => {
    await supertest(app)
      .get("/submissions")
      .set({ "api-key": "test" })
      .expect(404);
  });

  it("returns submissions for a specified local authority with correct authorisation", async () => {
    await supertest(app)
      .get(`/submissions/camden`)
      .set({ "api-key": "test" })
      .expect(200)
      .then((res) =>
        expect(res.body).toEqual([
          {
            id: 1,
            sessionId: "e6274dad-40ef-4e7a-b170-0c43ec8cfd9a",
            flowName: "Camden - Apply for a lawful development certificate",
            file: "http://localhost:7002/file/private/ocb61jk5/e6274dad-40ef-4e7a-b170-0c43ec8cfd9a.json",
            message: "New submission from PlanX",
            payloadType: "Validated ODP Schema",
            submittedAt: "2025-11-24T00:02:04.197753+00:00",
          },
        ]),
      );
  });

  it("returns a 204 not found if no submissions found for this local authority", async () => {
    queryMock.mockQuery({
      name: "GetS3Applications",
      variables: {
        teamSlug: "doncaster",
        createdAt: "2025-10-27T01:46:23.358Z",
      },
      matchOnVariables: false,
      data: { submissions: [] },
    });

    await supertest(app)
      .get(`/submissions/doncaster`)
      .set({ "api-key": "test" })
      .expect(204)
      .then((res) => expect(res.body).toEqual({}));
  });
});
