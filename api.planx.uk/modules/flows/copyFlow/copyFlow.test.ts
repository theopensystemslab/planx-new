import supertest from "supertest";

import app from "../../../server.js";
import { queryMock } from "../../../tests/graphqlQueryMock.js";
import { authHeader } from "../../../tests/mockJWT.js";
import { userContext } from "../../auth/middleware.js";
import {
  mockCopyFlowResponse,
  mockCopyFlowResponseInserted,
  mockFlowData,
} from "./mockFlowData.js";

beforeEach(() => {
  queryMock.mockQuery({
    name: "GetFlowData",
    matchOnVariables: false,
    data: {
      flow: {
        data: mockFlowData,
      },
    },
  });

  queryMock.mockQuery({
    name: "InsertFlow",
    matchOnVariables: false,
    data: {
      flow: {
        id: 2,
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
    name: "GetMostRecentPublishedFlow",
    matchOnVariables: false,
    data: {
      flow: {
        publishedFlows: [
          {
            data: mockFlowData,
          },
        ],
      },
    },
  });

  queryMock.mockQuery({
    name: "PublishFlow",
    matchOnVariables: false,
    data: {
      publishedFlow: {
        data: mockFlowData,
      },
    },
  });

  queryMock.mockQuery({
    name: "GetFlowPermissions",
    matchOnVariables: false,
    data: {
      flow: {
        isCopiable: true,
      },
    },
  });
});

const auth = authHeader({ role: "teamEditor" });

describe("authentication and error handling", () => {
  it("returns an error if authorization headers are not set", async () => {
    const validBody = {
      insert: false,
      replaceValue: "T3ST1",
    };

    await supertest(app)
      .post("/flows/1/copy")
      .send(validBody)
      .expect(401)
      .then((res) => {
        expect(res.body).toEqual({
          error: "No authorization token was found",
        });
      });
  });

  it("returns an error if the user does not have the correct role", async () => {
    const validBody = {
      insert: false,
      replaceValue: "T3ST1",
    };

    await supertest(app)
      .post("/flows/1/copy")
      .send(validBody)
      .set(authHeader({ role: "teamViewer" }))
      .expect(403);
  });

  it("returns an error if required replacement characters are not provided in the request body", async () => {
    const invalidBody = {
      insert: false,
    };

    await supertest(app)
      .post("/flows/1/copy")
      .send(invalidBody)
      .set(auth)
      .expect(400)
      .then((res) => {
        expect(res.body).toHaveProperty("issues");
        expect(res.body).toHaveProperty("name", "ZodError");
      });
  });

  it("returns a 500 error if the flow is not set as copiable in the database", async () => {
    queryMock.mockQuery({
      name: "GetFlowPermissions",
      matchOnVariables: false,
      data: {
        flow: {
          isCopiable: false,
        },
      },
    });

    const validBody = {
      insert: false,
      replaceValue: "T3ST1",
    };

    await supertest(app)
      .post("/flows/1/copy")
      .send(validBody)
      .set(auth)
      .expect(500)
      .then((res) => {
        expect(res.body.error).toMatch(
          /Flow copying is not permitted for this flow/,
        );
      });
  });

  it("returns an error if the operation to insert a new flow fails", async () => {
    const body = {
      insert: true,
      replaceValue: "T3ST1",
    };

    queryMock.mockQuery({
      name: "GetFlowData",
      matchOnVariables: false,
      data: {
        flow: {
          data: mockFlowData,
        },
      },
    });

    queryMock.mockQuery({
      name: "InsertFlow",
      matchOnVariables: false,
      data: {
        flow: {
          id: 2,
        },
      },
      graphqlErrors: [
        {
          message: "Something went wrong",
        },
      ],
      variables: {
        id: "3",
      },
    });

    await supertest(app)
      .post("/flows/3/copy")
      .send(body)
      .set(auth)
      .expect(500)
      .then((res) => {
        expect(res.body.error).toMatch(/failed to insert flow/);
        expect(res.body.error).toMatch(/Please check permissions/);
      });
  });
});

it("returns copied unique flow data without inserting a new record", async () => {
  const body = {
    insert: false,
    replaceValue: "T3ST1",
  };

  await supertest(app)
    .post("/flows/1/copy")
    .send(body)
    .set(auth)
    .expect(200)
    .then((res) => {
      expect(res.body).toEqual(mockCopyFlowResponse);
    });
});

it("inserts copied unique flow data", async () => {
  const body = {
    insert: true,
    replaceValue: "T3ST1",
  };

  await supertest(app)
    .post("/flows/1/copy")
    .send(body)
    .set(auth)
    .expect(200)
    .then((res) => {
      expect(res.body).toEqual(mockCopyFlowResponseInserted);
    });
});

it("throws an error if the a GraphQL operation fails", async () => {
  const body = {
    insert: true,
    replaceValue: "T3ST1",
  };

  queryMock.mockQuery({
    name: "GetFlowData",
    matchOnVariables: false,
    data: {
      flow: {
        data: null,
      },
    },
    graphqlErrors: [
      {
        message: "Something went wrong",
      },
    ],
  });

  await supertest(app)
    .post("/flows/1/copy")
    .send(body)
    .set(auth)
    .expect(500)
    .then((res) => {
      expect(res.body.error).toMatch(/Failed to copy flow/);
    });
});

it("throws an error if user details are missing", async () => {
  const getStoreMock = vi.spyOn(userContext, "getStore");
  getStoreMock.mockReturnValue(undefined);

  const body = {
    insert: true,
    replaceValue: "T3ST1",
  };

  await supertest(app)
    .post("/flows/1/copy")
    .send(body)
    .set(auth)
    .expect(500)
    .then((res) => {
      expect(res.body.error).toMatch(/Failed to copy flow/);
    });
});
