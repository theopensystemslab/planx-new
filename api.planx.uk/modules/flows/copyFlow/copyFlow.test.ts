import supertest from "supertest";

import { queryMock } from "../../../tests/graphqlQueryMock";
import { authHeader } from "../../../tests/mockJWT";
import app from "../../../server";
import { Flow } from "../../../types";
import { userContext } from "../../auth/middleware";

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
    name: "UpdateFlowData",
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
});

const auth = authHeader({ role: "teamEditor" });

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

it("returns an error if the operation to insert a new flow fails", async () => {
  queryMock.reset();

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
  const getStoreMock = jest.spyOn(userContext, "getStore");
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

// the original flow
const mockFlowData: Flow["data"] = {
  _root: {
    edges: ["rUilJQTag1", "kNX8Rej9rk"],
  },
  rUilJQTag1: {
    type: 100,
    data: {
      text: "Copy or paste?",
    },
    edges: ["Yh7t91FisE", "h8DSw40zNr"],
  },
  Yh7t91FisE: {
    type: 200,
    data: {
      text: "Copy",
    },
  },
  h8DSw40zNr: {
    type: 200,
    data: {
      text: "Paste",
    },
  },
  kNX8Rej9rk: {
    type: 110,
    data: {
      title: "Why do you want to copy this flow?",
      type: "short",
    },
  },
};

// the copied flow data with unique nodeIds using the replaceValue
const mockCopiedFlowData: Flow["data"] = {
  _root: {
    edges: ["rUilJT3ST1", "kNX8RT3ST1"],
  },
  rUilJT3ST1: {
    type: 100,
    data: {
      text: "Copy or paste?",
    },
    edges: ["Yh7t9T3ST1", "h8DSwT3ST1"],
  },
  Yh7t9T3ST1: {
    type: 200,
    data: {
      text: "Copy",
    },
  },
  h8DSwT3ST1: {
    type: 200,
    data: {
      text: "Paste",
    },
  },
  kNX8RT3ST1: {
    type: 110,
    data: {
      title: "Why do you want to copy this flow?",
      type: "short",
    },
  },
};

const mockCopyFlowResponse = {
  message: `Successfully copied undefined`, // 'undefined' just reflects that we haven't mocked a flow.name here!
  inserted: false,
  replaceValue: "T3ST1",
  data: mockCopiedFlowData,
};

const mockCopyFlowResponseInserted = {
  message: `Successfully copied undefined`,
  inserted: true,
  replaceValue: "T3ST1",
  data: mockCopiedFlowData,
};
