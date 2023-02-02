import nock from "nock";
import supertest from "supertest";
import { queryMock } from "../tests/graphqlQueryMock";
import app from "../server";

[
  {
    env: "production",
    bopsApiRootDomain: "bops.services",
  },
  {
    env: "staging",
    bopsApiRootDomain: "bops-staging.services",
  },
].forEach(({ env, bopsApiRootDomain }) => {
  describe(`sending an application to BOPS ${env}`, () => {
    const ORIGINAL_BOPS_API_ROOT_DOMAIN = process.env.BOPS_API_ROOT_DOMAIN;

    beforeEach(() => {
      queryMock.mockQuery({
        name: "FindApplication",
        matchOnVariables: false,
        data: {
          bops_applications: [],
        },
        variables: { sessionId: 123 },
      });

      queryMock.mockQuery({
        name: "CreateApplication",
        matchOnVariables: false,
        data: {
          insert_bops_applications_one: { id: 22 },
        },
        variables: {
          destination_url:
            "https://southwark.bops.services/api/v1/planning_applications",
        },
      });

      queryMock.mockQuery({
        name: "MarkSessionAsSubmitted",
        matchOnVariables: false,
        data: {
          update_lowcal_sessions_by_pk: { id: 123 },
        },
        variables: { sessionId: 123 },
      });
    });

    beforeAll(() => {
      process.env.BOPS_API_ROOT_DOMAIN = bopsApiRootDomain;
    });

    afterAll(() => {
      process.env.BOPS_API_ROOT_DOMAIN = ORIGINAL_BOPS_API_ROOT_DOMAIN;
    });

    it("proxies request and returns hasura id", async () => {
      nock(
        `https://southwark.${bopsApiRootDomain}/api/v1/planning_applications`
      )
        .post("")
        .reply(200, {
          application: "0000123",
        });

      await supertest(app)
        .post("/bops/southwark")
        .set({ Authorization: process.env.HASURA_PLANX_API_KEY })
        .send({
          payload: {
            applicationId: 123,
            planx_debug_data: { session_id: 123 },
          },
        })
        .expect(200)
        .then((res) => {
          expect(res.body).toEqual({
            application: { id: 22, bopsResponse: { application: "0000123" } },
          });
        });
    });

    it("requires auth", async () => {
      await supertest(app)
        .post("/bops/southwark")
        .send({
          payload: {
            applicationId: 123,
            planx_debug_data: { session_id: 123 },
          },
        })
        .expect(401);
    });
  });
});
