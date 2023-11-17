import supertest from "supertest";

import { queryMock } from "../../../tests/graphqlQueryMock";
import { authHeader } from "../../../tests/mockJWT";
import app from "../../../server";
import { Flow } from "../../../types";

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
});

it("requires a user to be logged in", async () => {
  await supertest(app).put("/flows/1/copy-portal/eyOm0NyDSl").expect(401);
});

it("requires a user to have the 'platformAdmin' role", async () => {
  await supertest(app)
    .put("/flows/1/copy-portal/eyOm0NyDSl")
    .set(authHeader({ role: "teamEditor" }))
    .expect(403);
});

it("throws an error if the portalNodeId parameter is not a portal (type = 300)", async () => {
  await supertest(app)
    .put("/flows/1/copy-portal/eyOm0NyDSl")
    .set(authHeader({ role: "platformAdmin" }))
    .expect(500)
    .then((res) => {
      expect(res.body.error).toMatch(/Failed to copy flow as portal/);
      expect(res.body.error).toMatch(/Unknown portalNodeId/);
    });
});

it("returns transformed, unique flow data for a valid internal portal", async () => {
  await supertest(app)
    .put("/flows/1/copy-portal/MgCe3pSTrt")
    .set(authHeader({ role: "platformAdmin" }))
    .expect(200)
    .then((res) => {
      // the portalNodeId param should have been overwritten as _root
      expect(Object.keys(res.body.data)).not.toContain("MgCe3pSTrt");

      // a question node from the parent flow should not be in the new portal flow data
      expect(Object.keys(res.body.data)).not.toContain("eyOm0NyDSl");

      expect(res.body).toEqual(mockCopyPortalResponse);
    });
});

// a "parent" flow with at least one internal portal
const mockFlowData: Flow["data"] = {
  _root: {
    edges: ["eyOm0NyDSl", "y5gQKVzLaj"],
  },
  eyOm0NyDSl: {
    type: 100,
    data: {
      text: "Enter the portal?",
    },
    edges: ["C3P6oywglW", "hpvbLNPrce"],
  },
  C3P6oywglW: {
    type: 200,
    data: {
      text: "Yes",
    },
    edges: ["MgCe3pSTrt"],
  },
  hpvbLNPrce: {
    type: 200,
    data: {
      text: "No thanks",
    },
  },
  MgCe3pSTrt: {
    type: 300,
    data: {
      text: "Portal to outer space",
    },
    edges: ["5nFnUmawC4"],
  },
  y5gQKVzLaj: {
    type: 8,
    data: {
      title: "You've reached the end",
      color: "#EFEFEF",
      resetButton: true,
    },
  },
  "5nFnUmawC4": {
    type: 100,
    data: {
      text: "What's your favorite constellation?",
    },
    edges: ["JZfAPwmfAY", "piEuo7Si3R", "HuGIVdJyro", "MTXe1zns7x"],
  },
  JZfAPwmfAY: {
    type: 200,
    data: {
      text: "Andromeda",
    },
  },
  piEuo7Si3R: {
    type: 200,
    data: {
      text: "Cassiopeia",
    },
  },
  HuGIVdJyro: {
    type: 200,
    data: {
      text: "Ursa Major",
    },
    edges: ["Df5Od4hIAH"],
  },
  MTXe1zns7x: {
    type: 200,
    data: {
      text: "Ursa Minor",
    },
  },
  Df5Od4hIAH: {
    type: 105,
    data: {
      allRequired: false,
      text: "Do you know it by any of these names?",
    },
    edges: ["HCnJOuOA1v", "Lj4EM4SCwJ", "0G7cGXpSQ7"],
  },
  HCnJOuOA1v: {
    data: {
      text: "Big Dipper",
    },
    type: 200,
  },
  Lj4EM4SCwJ: {
    data: {
      text: "The Plough",
    },
    type: 200,
  },
  "0G7cGXpSQ7": {
    data: {
      text: "Summer Triangle",
    },
    type: 200,
  },
};

// the new flow based on the portal & its' children: the portal node has been renamed to _root and all other node_ids have been made unique by replacing last 3 characters
const mockCopyPortalResponse = {
  message: "Successfully copied internal portal: Portal to outer space",
  data: {
    _root: {
      edges: ["5nFnUmaPor"],
    },
    "5nFnUmaPor": {
      data: {
        text: "What's your favorite constellation?",
      },
      type: 100,
      edges: ["JZfAPwmPor", "piEuo7SPor", "HuGIVdJPor", "MTXe1znPor"],
    },
    JZfAPwmPor: {
      data: {
        text: "Andromeda",
      },
      type: 200,
    },
    piEuo7SPor: {
      data: {
        text: "Cassiopeia",
      },
      type: 200,
    },
    HuGIVdJPor: {
      data: {
        text: "Ursa Major",
      },
      type: 200,
      edges: ["Df5Od4hPor"],
    },
    Df5Od4hPor: {
      data: {
        text: "Do you know it by any of these names?",
        allRequired: false,
      },
      type: 105,
      edges: ["HCnJOuOPor", "Lj4EM4SPor", "0G7cGXpPor"],
    },
    HCnJOuOPor: {
      data: {
        text: "Big Dipper",
      },
      type: 200,
    },
    Lj4EM4SPor: {
      data: {
        text: "The Plough",
      },
      type: 200,
    },
    "0G7cGXpPor": {
      data: {
        text: "Summer Triangle",
      },
      type: 200,
    },
    MTXe1znPor: {
      data: {
        text: "Ursa Minor",
      },
      type: 200,
    },
  },
};
