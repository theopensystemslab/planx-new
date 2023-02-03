import supertest from "supertest";

import { queryMock } from "../../tests/graphqlQueryMock";
import { authHeader } from "../../tests/mockJWT";
import app from "../../server";
import { Flow } from "../../types";

const flowDataBeforeMigration: Flow["data"] = {
  "_root": {
    "edges": [
      "dzDGABKiBN",
      "u3GrdN2UFO"
    ]
  },
  "dzDGABKiBN": {
    "type": 9
  },
  "u3GrdN2UFO": {
    "type": 8,
    "data": {
      "color": "#EFEFEF",
      "resetButton": true
    }
  }
};

const flowDataAfterMigration: Flow["data"] = {
  "_root": {
    "edges": [
      "dzDGABKiBN",
      "TESTTESTTEST",
      "u3GrdN2UFO"
    ]
  },
  "dzDGABKiBN": {
    "type": 9
  },
  "u3GrdN2UFO": {
    "type": 8,
    "data": {
      "color": "#EFEFEF",
      "resetButton": true
    }
  },
  "TESTTESTTEST": {
    "type": 12,
    "data": {
      "title": "About the property",
      "description": "This is the information we currently have about the property",
      "showPropertyTypeOverride": false
    }
  }
};

beforeEach(() => {
  queryMock.mockQuery({
    name: "GetFlowAndPublishedFlowData",
    matchOnVariables: false,
    data: {
      flows_by_pk: {
        data: flowDataBeforeMigration,
        published_flows: [
          {
            id: 1,
            data: flowDataBeforeMigration
          }
        ]
      }
    },
  });

  queryMock.mockQuery({
    name: "UpdateFlow",
    matchOnVariables: false, // TODO mock uniqueId() and set to 'true'
    variables: {
      id: "1",
      data: flowDataAfterMigration,
    },
    data: {
      update_flows_by_pk: {
        id: 1,
      },
    },
  });

  queryMock.mockQuery({
    name: "UpdatePublishedFlow",
    matchOnVariables: false, // TODO same as above
    variables: {
      id: 1,
      data: flowDataAfterMigration,
    },
    data: {
      update_published_flows_by_pk: {
        id: 1,
      },
    },
  });
});

it("returns an error if authorization headers are not set", async () => {
  await supertest(app)
    .get("/admin/splitFindProperty/1")
    .expect(401)
    .then((res) => {
      expect(res.body).toEqual({
        error: "No authorization token was found"
      });
    });
});

it("successfully inserts a PropertyInformation node into the flow and published flow data", async () => {
  await supertest(app)
    .get("/admin/splitFindProperty/1")
    .set(authHeader())
    .expect(200);
});
