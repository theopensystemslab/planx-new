import nock from "nock";
import supertest from "supertest";
import { queryMock } from "../tests/graphqlQueryMock";
import app from "../server";
import { mockFlow, mockSession } from "../tests/mocks/bopsMocks";

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
        matchOnVariables: true,
        data: {
          bops_applications: []
        },
        variables: { session_id: 123 },
      });

      queryMock.mockQuery({
        name: "FindApplication",
        matchOnVariables: true,
        data: {
          bops_applications: [
            { response: { message: "Application created", id: "bops_app_id" } }
          ]
        },
        variables: { session_id: "previously_submitted_app" },
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
          update_lowcal_sessions_by_pk: { id: 123 }
        },
        variables: { sessionId: 123 },
      });

      queryMock.mockQuery({
        name: "GetSessionById",
        variables: {
          id: 123,
        },
        data: {
          lowcal_sessions_by_pk: mockSession,
        },
      });

      queryMock.mockQuery({
        name: "GetLatestPublishedFlowData",
        variables: {
          flowId: "456",
        },
        data: {
          published_flows: [
            {
              data: mockFlow,
            },
          ],
        },
      });
  
      queryMock.mockQuery({
        name: "GetFlowSlug",
        variables: {
          flowId: "456",
        },
        data: {
          flows_by_pk: {
            slug: "apply-for-a-lawful-development-certificate",
          },
        },
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
        .send({ payload: { sessionId: 123 }})
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
        .send({ payload: { sessionId: 123 }})
        .expect(401)
    });

    it("throws an error if payload is missing", async () => {
      await supertest(app)
        .post("/bops/southwark")
        .set({ Authorization: process.env.HASURA_PLANX_API_KEY })
        .send({ payload: null })
        .expect(400)
        .then((res) => {
          expect(res.body.error).toMatch(/Missing application/);
        });
    });

    it("throws an error if team is unsupported", async () => {
      await supertest(app)
        .post("/bops/unsupported-team")
        .set({ Authorization: process.env.HASURA_PLANX_API_KEY })
        .send({ payload: { sessionId: 123 }})
        .expect(400)
        .then((res) => {
          expect(res.body.error).toMatch(/not enabled for this local authority/);
        });
    });

    it("does not re-send an application which has already been submitted", async () => {
      await supertest(app)
        .post("/bops/southwark")
        .set({ Authorization: process.env.HASURA_PLANX_API_KEY })
        .send({ payload: { sessionId: "previously_submitted_app" }})
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
});
