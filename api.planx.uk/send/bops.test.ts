import nock from "nock";
import { queryMock } from "../tests/graphqlQueryMock";
import { mockFlow, mockSession } from "../tests/mocks/bopsMocks";
import { sendToBOPS } from "./bops";

const environments = [
  {
    env: "production",
    bopsApiRootDomain: "bops.services",
  },
  {
    env: "staging",
    bopsApiRootDomain: "bops-staging.services",
  },
];

environments.forEach(({ env, bopsApiRootDomain }) => {
  describe(`sending an application to BOPS ${env}`, () => {
    const ORIGINAL_BOPS_API_ROOT_DOMAIN = process.env.BOPS_API_ROOT_DOMAIN;

    beforeEach(() => {
      queryMock.mockQuery({
        name: "FindApplication",
        matchOnVariables: true,
        data: {
          bops_applications: [],
        },
        variables: { session_id: "123" },
      });

      queryMock.mockQuery({
        name: "FindApplication",
        matchOnVariables: true,
        data: {
          bops_applications: [
            { response: { message: "Application created", id: "bops_app_id" } },
          ],
        },
        variables: { session_id: "previously_submitted_app" },
      });

      queryMock.mockQuery({
        name: "CreateBopsApplication",
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
          update_lowcal_sessions_by_pk: { id: "123" },
        },
        variables: { sessionId: "123" },
      });

      queryMock.mockQuery({
        name: "GetSessionById",
        variables: {
          id: "123",
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

      const response = await sendToBOPS({
        sessionId: "123",
        localAuthority: "southwark",
      });
      expect(response).toEqual({
        application: { id: 22, bopsResponse: { application: "0000123" } },
      });
    });

    it("throws an error if team is unsupported", async () => {
      const response = sendToBOPS({
        sessionId: "123",
        localAuthority: "not-found",
      });
      await expect(response).rejects.toEqual(
        new Error(
          `Back-office Planning System (BOPS) is not enabled for this local authority`
        )
      );
    });
  });
});
