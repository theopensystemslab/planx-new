import supertest from "supertest";

import app from "../../../server.js";
import { queryMock } from "../../../tests/graphqlQueryMock.js";
import type { Flow } from "../../../types.js";

const mockSourceTemplateFlowData: Flow["data"] = {
  _root: {
    edges: ["Content"],
  },
  Content: {
    type: 250,
    data: {
      text: "This a fake template",
      isTemplatedNode: true,
      templatedNodeInstructions: "Add help text",
      areTemplatedNodeInstructionsRequired: false,
    },
  },
};

const mockTemplatedFlowEdits = {
  Content: {
    data: {
      howMeasured: "This is how my council measures it",
    },
  },
};

// With "reconciliation" where templated_flow_edits have been applied/preserved
const mockUpdatedTemplatedFlowData: Flow["data"] = {
  _root: {
    edges: ["Content"],
  },
  Content: {
    type: 250,
    data: {
      text: "This a fake template",
      isTemplatedNode: true,
      templatedNodeInstructions: "Add help text",
      areTemplatedNodeInstructionsRequired: false,
      howMeasured: "This is how my council measures it",
    },
  },
};

// Triggered via Hasura webhook, so wrapped in `payload` without user or team-based auth
const validBody = {
  payload: {
    sourceFlowId: "1",
    templatedFlowId: "2",
  },
};

const invalidBody = { payload: {} };

describe("validation and error handling", () => {
  it("returns an error if required properties are missing in the request body", async () => {
    await supertest(app)
      .post("/flows/1/update-templated-flow/2")
      .send(invalidBody)
      .expect(400)
      .then((res) => {
        expect(res.body).toHaveProperty("issues");
        expect(res.body).toHaveProperty("name", "ZodError");
      });
  });
});

describe("success", () => {
  beforeEach(() => {
    queryMock.mockQuery({
      name: "GetFlowData",
      matchOnVariables: false,
      data: {
        flow: {
          data: mockSourceTemplateFlowData,
          publishedFlows: [
            {
              id: 3,
              summary: "Updated the source template",
              publisher_id: 1,
              created_at: "2025-07-01",
              data: mockSourceTemplateFlowData,
            },
          ],
        },
      },
    });

    queryMock.mockQuery({
      name: "InsertComment",
      matchOnVariables: false,
      data: {
        comment: {
          id: 1,
        },
      },
    });
  });

  it("correctly updates a templated flow that has been customised", async () => {
    queryMock.mockQuery({
      name: "GetTemplatedFlowEdits",
      matchOnVariables: false,
      data: {
        edits: {
          data: mockTemplatedFlowEdits,
        },
      },
    });

    queryMock.mockQuery({
      name: "UpdateTemplatedFlowData",
      matchOnVariables: false,
      data: {
        flow: {
          data: mockUpdatedTemplatedFlowData,
        },
      },
    });

    await supertest(app)
      .post("/flows/1/update-templated-flow/2")
      .send(validBody)
      .expect(200)
      .then((res) => {
        expect(res.body).toEqual({
          message:
            "Successfully updated templated flow on source publish (source ID 1, templated flow ID 2)",
          data: {
            templatedFlowData: mockUpdatedTemplatedFlowData,
            commentId: 1,
          },
        });
      });
  });

  it("correctly updates a templated flow that has not been customised yet", async () => {
    // A templated flow that has not been customised yet will not have a record in `templated_flow_edits` table
    queryMock.mockQuery({
      name: "GetTemplatedFlowEdits",
      matchOnVariables: false,
      data: {
        edits: null,
      },
    });

    // Without edits to merge or "reconcile", then the templated flow is updated to exactly match the source data
    queryMock.mockQuery({
      name: "UpdateTemplatedFlowData",
      matchOnVariables: false,
      data: {
        flow: {
          data: mockSourceTemplateFlowData,
        },
      },
    });

    await supertest(app)
      .post("/flows/1/update-templated-flow/2")
      .send(validBody)
      .expect(200)
      .then((res) => {
        expect(res.body).toEqual({
          message:
            "Successfully updated templated flow on source publish (source ID 1, templated flow ID 2)",
          data: {
            templatedFlowData: mockSourceTemplateFlowData,
            commentId: 1,
          },
        });
      });
  });
});
