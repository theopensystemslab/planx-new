import supertest from "supertest";
import nock from "nock";
import { queryMock } from "../../tests/graphqlQueryMock";
import app from "../routes";

const { post } = supertest(app);

describe("integration routes", () => {
  describe("/bops/:localAuthority", () => {
    afterEach(() => {
      queryMock.reset();
      nock.cleanAll();
    });

    test("unsupported :localAuthority", async () => {
      setUpMockBOPsApplication();
      await post("/bops/WRONG")
        .set({ Authorization: process.env.HASURA_PLANX_API_KEY! })
        .send({
          payload: {
            applicationId: 123,
            planx_debug_data: { session_id: 123 },
          },
        })
        .expect(404)
        .then((response) => {
          expect(response.text).toEqual(
            JSON.stringify({
              error:
                "Back-office Planning System (BOPS) is not enabled for this local authority",
            })
          );
        });
    });

    test("missing payload", async () => {
      await post("/bops/WRONG")
        .set({ Authorization: process.env.HASURA_PLANX_API_KEY! })
        .send(undefined)
        .expect(400);
    });
  });

  describe("/uniform/:localAuthority", () => {
    test.todo("TODO");
  });

  describe("/send-email/:template", () => {
    test.todo("TODO");
  });
});

function setUpMockBOPsApplication() {
  queryMock.mockQuery({
    name: "FindApplication",
    matchOnVariables: false,
    data: {
      bops_applications: [],
    },
    variables: { sessionId: 123 },
  });

  nock(
    `https://WRONG.${process.env.BOPS_API_ROOT_DOMAIN}/api/v1/planning_applications`
  )
    .post("")
    .reply(200, {
      application: "0000123",
    });
}
