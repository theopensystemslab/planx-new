import supertest from "supertest";
import app from "../routes";
import { queryMock } from "../../tests/graphqlQueryMock";
import { mockGetFlowData } from "../../tests/mocks/flowMocks";
import { authHeader } from "../../tests/mockJWT";

const { post } = supertest(app);

describe("flow routes", () => {
  describe("flows/:flowId/diff", () => {
    test.todo("unknown :flowId");
  });

  describe("flows/:flowId/publish", () => {
    test("unknown :flowId", async () => {
      await post("/flows/WRONG/publish").expect(401);
    });
  });

  describe("flows/:flowId/search", () => {
    test.skip("unknown flow id", async () => {
      await supertest(app)
        .post("/flows/WRONG/search")
        .set(authHeader())
        .expect(404)
        .then((response) => {
          expect(response.body).toEqual("Unknown flowId");
        });
    });

    test("missing auth", async () => {
      await post("/flows/1/search?find=x")
        .expect(401)
        .then((response) => {
          expect(response.body).toEqual({
            error: "No authorization token was found",
          });
        });
    });

    test.skip("missing find parameter", async () => {
      queryMock.reset();
      queryMock.mockQuery(mockGetFlowData);
      await supertest(app)
        .post("/flows/1/search")
        .set(authHeader())
        .expect(401)
        .then((response) => {
          expect(response.body).toEqual(
            'Expected at least one query parameter "find"'
          );
        });
    });
  });

  describe("/flows/:flowId/copy-portal/:portalNodeId", () => {
    test.todo("unknown :flowId");
    test.todo("unknown :portalNodeId");
  });

  describe("/flows/:flowId/download-schema", () => {
    test("unknown :flowId", async () => {
      await post("/flows/WRONG/download-schema").expect(404);
    });
  });
});
