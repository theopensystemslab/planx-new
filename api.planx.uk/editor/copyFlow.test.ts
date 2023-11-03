import supertest from "supertest";

import { queryMock } from "../tests/graphqlQueryMock";
import { authHeader } from "../tests/mockJWT";
import app from "../server";
import { Flow } from "../types";

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
});

const auth = authHeader({ role: "teamEditor" });

it("returns an error if authorization headers are not set", async () => {
  const validBody = {
    insert: false,
    replaceValue: "T3ST",
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
    replaceValue: "T3ST",
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
      expect(res.body).toEqual({
        error: "Missing required values to proceed",
      });
    });
});

it("returns copied unique flow data without inserting a new record", async () => {
  const body = {
    insert: false,
    replaceValue: "T3ST",
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
    replaceValue: "T3ST",
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
    edges: ["rUilJQT3ST", "kNX8ReT3ST"],
  },
  rUilJQT3ST: {
    type: 100,
    data: {
      text: "Copy or paste?",
    },
    edges: ["Yh7t91T3ST", "h8DSw4T3ST"],
  },
  Yh7t91T3ST: {
    type: 200,
    data: {
      text: "Copy",
    },
  },
  h8DSw4T3ST: {
    type: 200,
    data: {
      text: "Paste",
    },
  },
  kNX8ReT3ST: {
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
  replaceValue: "T3ST",
  data: mockCopiedFlowData,
};

const mockCopyFlowResponseInserted = {
  message: `Successfully copied undefined`,
  inserted: true,
  replaceValue: "T3ST",
  data: mockCopiedFlowData,
};
