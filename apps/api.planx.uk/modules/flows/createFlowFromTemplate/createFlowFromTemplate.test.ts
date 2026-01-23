import supertest from "supertest";

import { queryMock } from "../../../tests/graphqlQueryMock.js";
import { authHeader } from "../../../tests/mockJWT.js";
import app from "../../../server.js";
import type { Flow } from "../../../types.js";
import type { NewFlow } from "./controller.js";

const mockSourceTemplateFlowData: Flow["data"] = {
  _root: {
    edges: ["Content"],
  },
  Content: {
    type: 250,
    data: {
      text: "This a fake template",
    },
  },
};

const validBody: NewFlow = {
  teamId: 1,
  slug: "my-new-flow",
  name: "My New Flow",
};

const invalidBody = {};
const auth = authHeader({ role: "teamEditor" });

describe("validation and error handling", () => {
  it("returns an error if authorization headers are not set", async () => {
    await supertest(app)
      .post("/flows/create-from-template/1")
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
      .post("/flows/create-from-template/1")
      .send(validBody)
      .set(authHeader({ role: "teamViewer" }))
      .expect(403);
  });

  it("returns an error if required properties are missing in the request body", async () => {
    await supertest(app)
      .post("/flows/create-from-template/1")
      .send(invalidBody)
      .set(auth)
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
          data: mockSourceTemplateFlowData,
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
              data: mockSourceTemplateFlowData,
            },
          ],
        },
      },
    });

    queryMock.mockQuery({
      name: "GetDefaultEmail",
      matchOnVariables: false,
      data: {
        submissionIntegrations: [
          {
            id: "default-email-id",
          },
        ],
      },
    });

    queryMock.mockQuery({
      name: "InsertFlowIntegration",
      matchOnVariables: false,
      data: {
        insert_flow_integrations_one: {
          flow_id: 2,
        },
      },
    });
  });

  it("successfully creates a new flow from a template", async () => {
    await supertest(app)
      .post("/flows/create-from-template/1")
      .send(validBody)
      .set(auth)
      .expect(200)
      .then((res) => {
        expect(res.body).toEqual({
          message: "Successfully created flow from template id 1",
          id: "2",
          slug: "my-new-flow",
        });
      });
  });
});
