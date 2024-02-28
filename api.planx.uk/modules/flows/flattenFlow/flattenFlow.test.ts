import supertest from "supertest";

import app from "../../../server";
import { queryMock } from "../../../tests/graphqlQueryMock";
import {
  childFlow,
  draftParentFlow,
  flattenedParentFlow,
  mockFlowData,
} from "../../../tests/mocks/validateAndPublishMocks";

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
        slug: "mock-flow",
        team_id: 1,
        team: {
          slug: "testing",
        },
        publishedFlows: [{ data: mockFlowData }],
      },
    },
  });

  queryMock.mockQuery({
    name: "GetFlowData",
    matchOnVariables: true,
    variables: {
      id: "parent-flow-with-external-portal",
    },
    data: {
      flow: {
        data: draftParentFlow,
        slug: "parent-flow",
        team_id: 1,
        team: {
          slug: "testing",
        },
        publishedFlows: [{ data: flattenedParentFlow }],
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

it("returns the expected result for a simple flow without external portals when the ?draft=true query param is set", async () => {
  await supertest(app)
    .get("/flows/basic-flow-no-external-portals/flatten-data?draft=true")
    .expect(200)
    .then((res) => {
      expect(res.body).toEqual(mockFlowData);
    });
});

it("returns the expected result for a flow with published external portals", async () => {
  queryMock.mockQuery({
    name: "GetFlowData",
    matchOnVariables: true,
    variables: {
      id: "child-flow-id",
    },
    data: {
      flow: {
        data: childFlow,
        slug: "child-flow",
        team_id: 1,
        team: {
          slug: "testing",
        },
        publishedFlows: [{ data: childFlow }],
      },
    },
  });

  await supertest(app)
    .get("/flows/parent-flow-with-external-portal/flatten-data")
    .expect(200)
    .then((res) => expect(res.body).toEqual(flattenedParentFlow));
});

it("throws an error for a flow with unpublished external portals", async () => {
  queryMock.mockQuery({
    name: "GetFlowData",
    matchOnVariables: true,
    variables: {
      id: "child-flow-id",
    },
    data: {
      flow: {
        data: childFlow,
        slug: "child-flow",
        team_id: 1,
        team: {
          slug: "testing",
        },
        publishedFlows: [],
      },
    },
  });

  await supertest(app)
    .get("/flows/parent-flow-with-external-portal/flatten-data")
    .expect(500);
});

it("returns the expected draft result for a flow with unpublished external portals when ?draft=true query param is set", async () => {
  queryMock.mockQuery({
    name: "GetFlowData",
    matchOnVariables: true,
    variables: {
      id: "child-flow-id",
    },
    data: {
      flow: {
        data: childFlow,
        slug: "child-flow",
        team_id: 1,
        team: {
          slug: "testing",
        },
        publishedFlows: [],
      },
    },
  });

  await supertest(app)
    .get(
      "/flows/parent-flow-with-external-portal/flatten-data?draft=true",
    )
    .expect(200)
    .then((res) => expect(res.body).toEqual(flattenedParentFlow));
});

it("throws an error if no flow is found", async () => {
  await supertest(app).get("/flows/invalid-id/flatten-data").expect(500);
});
