import supertest from "supertest";

import app from "../../../server";
import { queryMock } from "../../../tests/graphqlQueryMock";
import { mockFlowData } from "../../../tests/mocks/validateAndPublishMocks";

beforeEach(() => {
  queryMock.mockQuery({
    name: "GetFlowData",
    matchOnVariables: true,
    variables: {
      id: "basic-flow-no-external-portals",
    },
    data: {
      flow: {
        data: mockFlowData,
        slug: "mock-flow-name",
        team_id: 1,
        team: {
          slug: "testing",
        },
        publishedFlows: [{ data: mockFlowData }],
      },
    },
  });
});

it("is publicly accessible and does not require a user to be signed in", async () => {
  await supertest(app)
    .get("/flows/basic-flow-no-external-portals/flatten-data")
    .expect(200);
});

it("returns the expected result for a simple flow without external portals", async () => {
  await supertest(app)
    .get("/flows/basic-flow-no-external-portals/flatten-data")
    .expect(200)
    .then((res) => {
      expect(res.body).toEqual(mockFlowData);
    });
});

it.todo("throws an error for a flow with unpublished external portals");

it.todo(
  "returns the expected draft result for a flow with unpublished external portals if ?unpublished=true query param is set",
);

it("throws an error if no flow is found", async () => {
  await supertest(app).get("/flows/invalid-id/flatten-data").expect(500);
});
