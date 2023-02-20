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
      flows_by_pk: {
        data: mockFlowData,
        slug: "test",
      },
    },
  });

  queryMock.mockQuery({
    name: "UpdateFlow",
    matchOnVariables: false,
    data: {
      update_flows_by_pk: {
        data: replacedFlowData,
        slug: "test",
      },
    },
  });
});

it("throws an error if missing query parameter `find`", async () => {
  await supertest(app)
    .post("/flows/1/search")
    .set(authHeader())
    .expect(401)
    .then((res) => {
      expect(res.body).toEqual({
        error: `Expected at least one query parameter "find"`,
      });
    });
});

it("finds matches", async () => {
  await supertest(app)
    .post("/flows/1/search?find=designated.monument")
    .set(authHeader())
    .expect(200)
    .then((res) => {
      expect(res.body).toEqual({
        message: `Found 2 matches of "designated.monument" in this flow`,
        matches: {
          AJnWX6O1xt: {
            data: {
              val: "designated.monument",
            },
          },
          Hfh8KuSzUq: {
            data: {
              val: "designated.monument",
            },
          },
        },
      });
    });
});

it("does not replace if no matches are found", async () => {
  await supertest(app)
    .post("/flows/1/search?find=bananas&replace=monument")
    .set(authHeader())
    .expect(200)
    .then((res) => {
      expect(res.body).toEqual({
        message: `Didn't find "bananas" in this flow, nothing to replace`,
      });
    });
});

it("updates flow data and returns matches if there are matches", async () => {
  await supertest(app)
    .post("/flows/1/search?find=designated.monument&replace=monument")
    .set(authHeader())
    .expect(200)
    .then((res) => {
      expect(res.body).toEqual({
        message: `Found 2 matches of "designated.monument" and replaced with "monument"`,
        matches: {
          AJnWX6O1xt: {
            data: {
              val: "designated.monument",
            },
          },
          Hfh8KuSzUq: {
            data: {
              val: "designated.monument",
            },
          },
        },
        updatedFlow: replacedFlowData,
      });
    });
});

const mockFlowData: Flow["data"] = {
  _root: {
    edges: ["RRQwM2zAgy", "vcTgmVQAre", "QsEdip17H5"],
  },
  "6dwuQp5xjA": {
    data: {
      text: "No",
    },
    type: 200,
  },
  "8AWcYxZgBw": {
    data: {
      fn: "property.constraints.planning",
      text: "Is it monument inside a portal?",
    },
    type: 100,
    edges: ["AJnWX6O1xt", "6dwuQp5xjA"],
  },
  AJnWX6O1xt: {
    data: {
      val: "designated.monument",
      text: "Yes",
    },
    type: 200,
  },
  Hfh8KuSzUq: {
    data: {
      val: "designated.monument",
      text: "Yes",
    },
    type: 200,
  },
  RRQwM2zAgy: {
    data: {
      fn: "property.constraints.planning",
      text: "Is it a monument",
    },
    type: 100,
    edges: ["Hfh8KuSzUq", "ft26KlH7Oy"],
  },
  ft26KlH7Oy: {
    data: {
      text: "No",
    },
    type: 200,
  },
  vcTgmVQAre: {
    data: {
      text: "internal-portal-test",
    },
    type: 300,
    edges: ["8AWcYxZgBw"],
  },
  QsEdip17H5: {
    type: 310,
    data: {
      flowId: "f54b6505-c352-4fbc-aca3-7c4be99b49d4",
    },
  },
};

const replacedFlowData: Flow["data"] = {
  _root: {
    edges: ["RRQwM2zAgy", "vcTgmVQAre", "QsEdip17H5"],
  },
  "6dwuQp5xjA": {
    data: {
      text: "No",
    },
    type: 200,
  },
  "8AWcYxZgBw": {
    data: {
      fn: "property.constraints.planning",
      text: "Is it monument inside a portal?",
    },
    type: 100,
    edges: ["AJnWX6O1xt", "6dwuQp5xjA"],
  },
  AJnWX6O1xt: {
    data: {
      val: "monument",
      text: "Yes",
    },
    type: 200,
  },
  Hfh8KuSzUq: {
    data: {
      val: "monument",
      text: "Yes",
    },
    type: 200,
  },
  RRQwM2zAgy: {
    data: {
      fn: "property.constraints.planning",
      text: "Is it a monument",
    },
    type: 100,
    edges: ["Hfh8KuSzUq", "ft26KlH7Oy"],
  },
  ft26KlH7Oy: {
    data: {
      text: "No",
    },
    type: 200,
  },
  vcTgmVQAre: {
    data: {
      text: "internal-portal-test",
    },
    type: 300,
    edges: ["8AWcYxZgBw"],
  },
  QsEdip17H5: {
    type: 310,
    data: {
      flowId: "f54b6505-c352-4fbc-aca3-7c4be99b49d4",
    },
  },
};
