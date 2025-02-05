import supertest from "supertest";

import { queryMock } from "../../../tests/graphqlQueryMock.js";
import { authHeader } from "../../../tests/mockJWT.js";
import app from "../../../server.js";
import type { Flow } from "../../../types.js";

const mockNewFlowData: Flow["data"] = {
  _root: {
    edges: [],
  },
};

const validBody = {
  teamId: 1,
  slug: "my-new-flow",
  name: "My new flow",
  data: mockNewFlowData,
};

const invalidBody = {
  slug: "my-new-flow",
  data: mockNewFlowData,
};

beforeEach(() => {
  queryMock.mockQuery({
    name: "GetFlowData",
    matchOnVariables: false,
    data: {
      flow: {
        data: mockNewFlowData,
      },
    },
  });

  queryMock.mockQuery({
    name: "InsertFlow",
    matchOnVariables: false,
    data: {
      flow: {
        id: "2",
      },
    },
  });

  queryMock.mockQuery({
    name: "InsertOperation",
    matchOnVariables: false,
    data: {
      operation: {
        id: 1,
      },
    },
  });

  queryMock.mockQuery({
    name: "PublishFlow",
    matchOnVariables: false,
    data: {
      publishedFlow: {
        data: mockNewFlowData,
      },
    },
  });

  queryMock.mockQuery({
    name: "GetMostRecentPublishedFlow",
    matchOnVariables: false,
    data: {
      flow: {
        publishedFlows: [
          {
            data: mockNewFlowData,
          },
        ],
      },
    },
  });
});

const auth = authHeader({ role: "teamEditor" });

it("returns an error if authorization headers are not set", async () => {
  await supertest(app)
    .post("/flows/create")
    .send(validBody)
    .expect(401)
    .then((res) => {
      expect(res.body).toEqual({
        error: "No authorization token was found",
      });
    });
});

it("returns an error if the user does not have the correct role", async () => {
  await supertest(app)
    .post("/flows/create")
    .send(validBody)
    .set(authHeader({ role: "teamViewer" }))
    .expect(403);
});

it("returns an error if required properties are missing in the request body", async () => {
  await supertest(app)
    .post("/flows/create")
    .send(invalidBody)
    .set(auth)
    .expect(400)
    .then((res) => {
      expect(res.body).toHaveProperty("issues");
      expect(res.body).toHaveProperty("name", "ZodError");
    });
});

it("returns an error when the service errors", async () => {
  queryMock.reset();
  queryMock.mockQuery({
    name: "InsertFlow",
    variables: {
      team_id: 1,
      slug: "my-new-flow",
      name: "My new flow",
      data: mockNewFlowData,
    },
    data: {},
    graphqlErrors: [
      {
        message: "Something went wrong",
      },
    ],
  });

  await supertest(app)
    .post("/flows/create")
    .send(validBody)
    .set(auth)
    .expect(500)
    .then((res) => {
      expect(res.body.error).toMatch(/Failed to create flow/);
    });
});

it("successfully creates a new flow", async () => {
  await supertest(app)
    .post("/flows/create")
    .send(validBody)
    .set(auth)
    .expect(200)
    .then((res) => {
      expect(res.body).toEqual({
        message: `Successfully created flow ${validBody.slug}`,
        id: "2",
        slug: validBody.slug,
      });
    });
});
