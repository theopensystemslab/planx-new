import supertest from "supertest";

import { queryMock } from "../../../tests/graphqlQueryMock.js";
import { authHeader, getTestJWT } from "../../../tests/mockJWT.js";
import app from "../../../server.js";
import { flowWithInviteToPay } from "../../../tests/mocks/inviteToPayData.js";
import { userContext } from "../../auth/middleware.js";
import type { FlowGraph } from "@opensystemslab/planx-core/types";
import { mockFlowData } from "../../../tests/mocks/validateAndPublishMocks.js";

beforeAll(() => {
  const getStoreMock = vi.spyOn(userContext, "getStore");
  getStoreMock.mockReturnValue({
    user: {
      sub: "123",
      jwt: getTestJWT({ role: "teamEditor" }),
    },
  });
});

beforeEach(() => {
  queryMock.mockQuery({
    name: "GetFlowData",
    matchOnVariables: false,
    data: {
      flow: {
        data: mockFlowData,
        slug: "flow-name",
        team_id: 1,
        team: {
          slug: "testing",
        },
        publishedFlows: [{ data: mockFlowData }],
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
    name: "GetMostRecentPublishedFlowVersion",
    matchOnVariables: false,
    data: {
      flow: {
        publishedFlows: [
          {
            createdAt: "2024-12-31",
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
    name: "GetHistory",
    matchOnVariables: false,
    data: {
      history: [
        {
          id: 1,
          createdAt: "2025-01-01",
          firstName: "Test",
          lastName: "Editor",
          type: "comment",
          data: null,
          comment: "Changed order of about the applicant questions",
        },
      ],
    },
  });

  queryMock.mockQuery({
    name: "GetTemplatedFlows",
    matchOnVariables: false,
    data: {
      flow: {
        templatedFlows: [],
      },
    },
  });

  queryMock.mockQuery({
    name: "GetTemplatedFlowEdits",
    matchOnVariables: false,
    data: {
      flow: {
        templatedFrom: null,
        edits: null,
      },
    },
  });
});

const auth = authHeader({ role: "platformAdmin" });

it("requires a user to be logged in", async () => {
  await supertest(app).post("/flows/1/diff").expect(401);
});

it("requires a user to have the 'teamEditor' role", async () => {
  await supertest(app)
    .post("/flows/1/diff")
    .set(authHeader({ role: "teamViewer" }))
    .expect(403);
});

describe("sections validation on diff", () => {
  it("does not update if there are sections in an external portal", async () => {
    const alteredFlow = {
      ...mockFlowData,
      externalPortalNodeId: {
        edges: ["newSectionNodeId"],
        type: 310,
      },
      newSectionNodeId: {
        type: 360,
      },
    };

    queryMock.mockQuery({
      name: "GetFlowData",
      matchOnVariables: false,
      data: {
        flow: {
          data: alteredFlow,
          slug: "altered-flow-name",
          team_id: 1,
          team: {
            slug: "testing",
          },
          publishedFlows: [{ data: alteredFlow }],
        },
      },
    });

    await supertest(app)
      .post("/flows/1/diff")
      .set(auth)
      .expect(200)
      .then((res) => {
        expect(res.body.message).toEqual("Changes queued to publish");
        expect(res.body.validationChecks).toEqual([
          {
            title: "Sections",
            status: "Fail",
            message:
              "Found Sections in one or more External Portals, but Sections are only allowed in main flow",
          },
          {
            title: "Fees",
            status: "Not applicable",
            message: "Your flow is not using Pay",
          },
          {
            title: "Invite to Pay",
            status: "Not applicable",
            message: "Your flow is not using Invite to Pay",
          },
          {
            title: "File types",
            status: "Not applicable",
            message: "Your flow is not using FileUpload or UploadAndLabel",
          },
          {
            title: "Project types",
            status: "Not applicable",
            message:
              'Your flow is not using Checklists which set "proposal.projectType"',
          },
          {
            title: "Planning Constraints",
            status: "Not applicable",
            message: "Your flow is not using Planning Constraints",
          },
          {
            title: "Templated nodes",
            status: "Not applicable",
            message: "This is not a templated flow",
          },
        ]);
      });
  });

  it("does not update if there are sections, but there is not a section in the first position", async () => {
    const flowWithSections: FlowGraph = {
      _root: {
        edges: ["questionNode", "sectionNode"],
      },
      questionNode: {},
      sectionNode: {
        type: 360,
      },
    };

    queryMock.mockQuery({
      name: "GetFlowData",
      matchOnVariables: false,
      data: {
        flow: {
          data: flowWithSections,
          slug: "sections-flow-name",
          team_id: 1,
          team: {
            slug: "testing",
          },
          publishedFlows: [{ data: flowWithSections }],
        },
      },
    });

    await supertest(app)
      .post("/flows/1/diff")
      .set(auth)
      .expect(200)
      .then((res) => {
        expect(res.body.message).toEqual("Changes queued to publish");
        expect(res.body.validationChecks).toEqual([
          {
            title: "Sections",
            status: "Fail",
            message: "When using Sections, your flow must start with a Section",
          },
          {
            title: "Fees",
            status: "Not applicable",
            message: "Your flow is not using Pay",
          },
          {
            title: "Invite to Pay",
            status: "Not applicable",
            message: "Your flow is not using Invite to Pay",
          },
          {
            title: "File types",
            status: "Not applicable",
            message: "Your flow is not using FileUpload or UploadAndLabel",
          },
          {
            title: "Project types",
            status: "Not applicable",
            message:
              'Your flow is not using Checklists which set "proposal.projectType"',
          },
          {
            title: "Planning Constraints",
            status: "Not applicable",
            message: "Your flow is not using Planning Constraints",
          },
          {
            title: "Templated nodes",
            status: "Not applicable",
            message: "This is not a templated flow",
          },
        ]);
      });
  });
});

describe("invite to pay validation on diff", () => {
  it("does not update if invite to pay is enabled, but there is not a Send component", async () => {
    const { Send: _Send, ...invalidatedFlow } = flowWithInviteToPay;
    invalidatedFlow["_root"].edges?.splice(
      invalidatedFlow["_root"].edges?.indexOf("Send"),
    );

    queryMock.mockQuery({
      name: "GetFlowData",
      matchOnVariables: false,
      data: {
        flow: {
          data: invalidatedFlow,
        },
      },
    });

    await supertest(app)
      .post("/flows/1/diff")
      .set(auth)
      .expect(200)
      .then((res) => {
        expect(res.body.message).toEqual("Changes queued to publish");
        expect(res.body.validationChecks).toEqual([
          {
            title: "Invite to Pay",
            status: "Fail",
            message: "When using Invite to Pay, your flow must have a Send",
          },
          {
            title: "Fees",
            status: "Pass",
            message: "Your flow has valid Pay using Set Fees",
          },
          {
            title: "Project types",
            status: "Pass",
            message:
              "Project types set via Checklists are all supported by the ODP Schema",
          },
          {
            title: "Sections",
            status: "Not applicable",
            message: "Your flow is not using Sections",
          },
          {
            title: "File types",
            status: "Not applicable",
            message: "Your flow is not using FileUpload or UploadAndLabel",
          },
          {
            title: "Planning Constraints",
            status: "Not applicable",
            message: "Your flow is not using Planning Constraints",
          },
          {
            title: "Templated nodes",
            status: "Not applicable",
            message: "This is not a templated flow",
          },
        ]);
      });
  });

  it("does not update if invite to pay is enabled, but there is more than one Send component", async () => {
    const alteredFlow = {
      ...flowWithInviteToPay,
      secondSend: {
        type: 650,
        data: {
          destinations: ["bops", "email"],
        },
      },
    };

    queryMock.mockQuery({
      name: "GetFlowData",
      matchOnVariables: false,
      data: {
        flow: {
          data: alteredFlow,
          slug: "altered-flow-name",
          team_id: 1,
          team: {
            slug: "testing",
          },
          publishedFlows: [{ data: alteredFlow }],
        },
      },
    });

    await supertest(app)
      .post("/flows/1/diff")
      .set(auth)
      .expect(200)
      .then((res) => {
        expect(res.body.message).toEqual("Changes queued to publish");
        expect(res.body.validationChecks).toEqual([
          {
            title: "Invite to Pay",
            status: "Fail",
            message:
              "When using Invite to Pay, your flow must have exactly ONE Send. It can select many destinations",
          },
          {
            title: "Fees",
            status: "Pass",
            message: "Your flow has valid Pay using Set Fees",
          },
          {
            title: "Project types",
            status: "Pass",
            message:
              "Project types set via Checklists are all supported by the ODP Schema",
          },
          {
            title: "Sections",
            status: "Not applicable",
            message: "Your flow is not using Sections",
          },
          {
            title: "File types",
            status: "Not applicable",
            message: "Your flow is not using FileUpload or UploadAndLabel",
          },
          {
            title: "Planning Constraints",
            status: "Not applicable",
            message: "Your flow is not using Planning Constraints",
          },
          {
            title: "Templated nodes",
            status: "Not applicable",
            message: "This is not a templated flow",
          },
        ]);
      });
  });

  it("does not update if invite to pay is enabled, but there is not a FindProperty (`_address`) component", async () => {
    const { FindProperty: _FindProperty, ...invalidatedFlow } =
      flowWithInviteToPay;
    invalidatedFlow["_root"].edges?.splice(
      invalidatedFlow["_root"].edges?.indexOf("FindProperty"),
    );

    queryMock.mockQuery({
      name: "GetFlowData",
      matchOnVariables: false,
      data: {
        flow: {
          data: invalidatedFlow,
          slug: "invalidated-flow-name",
          team_id: 1,
          team: {
            slug: "testing",
          },
          publishedFlows: [{ data: invalidatedFlow }],
        },
      },
    });

    await supertest(app)
      .post("/flows/1/diff")
      .set(auth)
      .expect(200)
      .then((res) => {
        expect(res.body.message).toEqual("Changes queued to publish");
        expect(res.body.validationChecks).toEqual([
          {
            title: "Invite to Pay",
            status: "Fail",
            message:
              "When using Invite to Pay, your flow must have a FindProperty",
          },
          {
            title: "Fees",
            status: "Pass",
            message: "Your flow has valid Pay using Set Fees",
          },
          {
            title: "Project types",
            status: "Pass",
            message:
              "Project types set via Checklists are all supported by the ODP Schema",
          },
          {
            title: "Sections",
            status: "Not applicable",
            message: "Your flow is not using Sections",
          },
          {
            title: "File types",
            status: "Not applicable",
            message: "Your flow is not using FileUpload or UploadAndLabel",
          },
          {
            title: "Planning Constraints",
            status: "Not applicable",
            message: "Your flow is not using Planning Constraints",
          },
          {
            title: "Templated nodes",
            status: "Not applicable",
            message: "This is not a templated flow",
          },
        ]);
      });
  });

  it("does not update if invite to pay is enabled, but there is more than one Pay component", async () => {
    const invalidFlow = {
      ...flowWithInviteToPay,
      PayTwo: { ...flowWithInviteToPay.Pay },
      _root: {
        edges: [...flowWithInviteToPay._root.edges!, "PayTwo"],
      },
    };

    queryMock.mockQuery({
      name: "GetFlowData",
      matchOnVariables: false,
      data: {
        flow: {
          data: invalidFlow,
          slug: "invalid-flow-name",
          team_id: 1,
          team: {
            slug: "testing",
          },
          publishedFlows: [{ data: invalidFlow }],
        },
      },
    });

    await supertest(app)
      .post("/flows/1/diff")
      .set(auth)
      .expect(200)
      .then((res) => {
        expect(res.body.message).toEqual("Changes queued to publish");
        expect(res.body.validationChecks).toEqual([
          {
            title: "Invite to Pay",
            status: "Fail",
            message:
              "When using Invite to Pay, your flow must have exactly ONE Pay",
          },
          {
            title: "Fees",
            status: "Pass",
            message: "Your flow has valid Pay using Set Fees",
          },
          {
            title: "Project types",
            status: "Pass",
            message:
              "Project types set via Checklists are all supported by the ODP Schema",
          },
          {
            title: "Sections",
            status: "Not applicable",
            message: "Your flow is not using Sections",
          },
          {
            title: "File types",
            status: "Not applicable",
            message: "Your flow is not using FileUpload or UploadAndLabel",
          },
          {
            title: "Planning Constraints",
            status: "Not applicable",
            message: "Your flow is not using Planning Constraints",
          },
          {
            title: "Templated nodes",
            status: "Not applicable",
            message: "This is not a templated flow",
          },
        ]);
      });
  });
});

describe("set fees validation on diff", () => {
  it("does not update if there is a Pay component, but there is not a SetFee component", async () => {
    const { SetFee: _SetFee, ...invalidatedFlow } = flowWithInviteToPay;
    invalidatedFlow["_root"].edges?.splice(
      invalidatedFlow["_root"].edges?.indexOf("SetFee"),
    );

    queryMock.mockQuery({
      name: "GetFlowData",
      matchOnVariables: false,
      data: {
        flow: {
          data: invalidatedFlow,
        },
      },
    });

    await supertest(app)
      .post("/flows/1/diff")
      .set(auth)
      .expect(200)
      .then((res) => {
        expect(res.body.message).toEqual("Changes queued to publish");
        expect(res.body.validationChecks).toEqual([
          {
            title: "Fees",
            status: "Fail",
            message:
              "When using Pay, your flow must also use Set Fees to generate an accurate fee breakdown",
          },
          {
            title: "Invite to Pay",
            status: "Pass",
            message: "Your flow has valid Invite to Pay",
          },
          {
            title: "Project types",
            status: "Pass",
            message:
              "Project types set via Checklists are all supported by the ODP Schema",
          },
          {
            title: "Sections",
            status: "Not applicable",
            message: "Your flow is not using Sections",
          },
          {
            title: "File types",
            status: "Not applicable",
            message: "Your flow is not using FileUpload or UploadAndLabel",
          },
          {
            title: "Planning Constraints",
            status: "Not applicable",
            message: "Your flow is not using Planning Constraints",
          },
          {
            title: "Templated nodes",
            status: "Not applicable",
            message: "This is not a templated flow",
          },
        ]);
      });
  });
});

describe("ODP Schema file type validation on diff", () => {
  it("fails if any file data fields aren't supported by the ODP Schema", async () => {
    const alteredFlow = {
      ...mockFlowData,
      fileUpload: {
        type: 140,
        data: {
          color: "#EFEFEF",
          fn: "roofPlan.existing",
          title: "Roof plans",
        },
      },
      fileUploadAndLabel: {
        type: 145,
        data: {
          title: "Upload and label",
          fileTypes: [
            {
              name: "Site plans",
              fn: "sitePlanTypo",
              rule: {
                condition: "AlwaysRequired",
              },
            },
            {
              name: "Heritage statement",
              fn: "heritageStatement",
              rule: {
                condition: "AlwaysRequired",
              },
            },
          ],
          hideDropZone: false,
        },
      },
    };

    queryMock.mockQuery({
      name: "GetFlowData",
      matchOnVariables: false,
      data: {
        flow: {
          data: alteredFlow,
          slug: "altered-flow-name",
          team_id: 1,
          team: {
            slug: "testing",
          },
          publishedFlows: [{ data: alteredFlow }],
        },
      },
    });

    await supertest(app)
      .post("/flows/1/diff")
      .set(auth)
      .expect(200)
      .then((res) => {
        expect(res.body.message).toEqual("Changes queued to publish");
        expect(res.body.validationChecks).toEqual([
          {
            title: "File types",
            status: "Fail",
            message:
              "Your FileUpload or UploadAndLabel are setting data fields that are not supported by the current release of the ODP Schema: sitePlanTypo (1)",
          },
          {
            title: "Sections",
            status: "Pass",
            message: "Your flow has valid Sections",
          },
          {
            title: "Fees",
            status: "Not applicable",
            message: "Your flow is not using Pay",
          },
          {
            title: "Invite to Pay",
            status: "Not applicable",
            message: "Your flow is not using Invite to Pay",
          },
          {
            title: "Project types",
            status: "Not applicable",
            message:
              'Your flow is not using Checklists which set "proposal.projectType"',
          },
          {
            title: "Planning Constraints",
            status: "Not applicable",
            message: "Your flow is not using Planning Constraints",
          },
          {
            title: "Templated nodes",
            status: "Not applicable",
            message: "This is not a templated flow",
          },
        ]);
      });
  });

  it("skips validation checks for UploadAndLabel components used in info-only mode with hidden dropzone", async () => {
    const alteredFlow = {
      ...mockFlowData,
      fileUpload: {
        type: 140,
        data: {
          color: "#EFEFEF",
          fn: "roofPlan.existing",
          title: "Roof plans",
        },
      },
      fileUploadAndLabelInfoOnly: {
        type: 145,
        data: {
          title: "Prepare these documents",
          fileTypes: [
            {
              name: "Design and access statement",
              fn: "designAndAccessTypo",
              rule: {
                condition: "AlwaysRequired",
              },
            },
          ],
          hideDropZone: true,
        },
      },
    };

    queryMock.mockQuery({
      name: "GetFlowData",
      matchOnVariables: false,
      data: {
        flow: {
          data: alteredFlow,
          slug: "altered-flow-name",
          team_id: 1,
          team: {
            slug: "testing",
          },
          publishedFlows: [{ data: alteredFlow }],
        },
      },
    });

    await supertest(app)
      .post("/flows/1/diff")
      .set(auth)
      .expect(200)
      .then((res) => {
        expect(res.body.message).toEqual("Changes queued to publish");
        expect(res.body.validationChecks).toEqual([
          {
            title: "Sections",
            status: "Pass",
            message: "Your flow has valid Sections",
          },
          {
            title: "File types",
            status: "Pass",
            message:
              "Files collected via FileUpload or UploadAndLabel are all supported by the ODP Schema",
          },
          {
            title: "Fees",
            status: "Not applicable",
            message: "Your flow is not using Pay",
          },
          {
            title: "Invite to Pay",
            status: "Not applicable",
            message: "Your flow is not using Invite to Pay",
          },
          {
            title: "Project types",
            status: "Not applicable",
            message:
              'Your flow is not using Checklists which set "proposal.projectType"',
          },
          {
            title: "Planning Constraints",
            status: "Not applicable",
            message: "Your flow is not using Planning Constraints",
          },
          {
            title: "Templated nodes",
            status: "Not applicable",
            message: "This is not a templated flow",
          },
        ]);
      });
  });
});

describe("planning constraints validation on diff", () => {
  it("passes if there is exactly one planning constraints component", async () => {
    const alteredFlow = {
      ...mockFlowData,
      PlanningConstraints: {
        type: 11,
        data: {
          title: "Check all constraints",
          fn: "property.constraints.planning",
        },
      },
    };

    queryMock.mockQuery({
      name: "GetFlowData",
      matchOnVariables: false,
      data: {
        flow: {
          data: alteredFlow,
          slug: "altered-flow-name",
          team_id: 1,
          team: {
            slug: "testing",
          },
          publishedFlows: [{ data: alteredFlow }],
        },
      },
    });

    await supertest(app)
      .post("/flows/1/diff")
      .set(auth)
      .expect(200)
      .then((res) => {
        expect(res.body.message).toEqual("Changes queued to publish");
        expect(res.body.validationChecks).toEqual([
          {
            title: "Sections",
            status: "Pass",
            message: "Your flow has valid Sections",
          },
          {
            title: "Planning Constraints",
            status: "Pass",
            message: "Your flow has valid Planning Constraints",
          },
          {
            title: "Fees",
            status: "Not applicable",
            message: "Your flow is not using Pay",
          },
          {
            title: "Invite to Pay",
            status: "Not applicable",
            message: "Your flow is not using Invite to Pay",
          },
          {
            title: "File types",
            status: "Not applicable",
            message: "Your flow is not using FileUpload or UploadAndLabel",
          },
          {
            title: "Project types",
            status: "Not applicable",
            message:
              'Your flow is not using Checklists which set "proposal.projectType"',
          },
          {
            title: "Templated nodes",
            status: "Not applicable",
            message: "This is not a templated flow",
          },
        ]);
      });
  });

  it("warns if there is more than one planning constraints component", async () => {
    const alteredFlow = {
      ...mockFlowData,
      PlanningConstraints: {
        type: 11,
        data: {
          title: "Check all constraints",
          fn: "property.constraints.planning",
        },
      },
      PlanningConstraintsTwo: {
        type: 11,
        data: {
          title: "Check all constraints (dupe)",
          fn: "property.constraints.planning",
        },
      },
    };

    queryMock.mockQuery({
      name: "GetFlowData",
      matchOnVariables: false,
      data: {
        flow: {
          data: alteredFlow,
          slug: "altered-flow-name",
          team_id: 1,
          team: {
            slug: "testing",
          },
          publishedFlows: [{ data: alteredFlow }],
        },
      },
    });

    await supertest(app)
      .post("/flows/1/diff")
      .set(auth)
      .expect(200)
      .then((res) => {
        expect(res.body.message).toEqual("Changes queued to publish");
        expect(res.body.validationChecks).toEqual([
          {
            title: "Planning Constraints",
            status: "Fail",
            message:
              "When using Planning Constraints, your flow must have exactly ONE Planning Constraints component",
          },
          {
            title: "Sections",
            status: "Pass",
            message: "Your flow has valid Sections",
          },
          {
            title: "Fees",
            status: "Not applicable",
            message: "Your flow is not using Pay",
          },
          {
            title: "Invite to Pay",
            status: "Not applicable",
            message: "Your flow is not using Invite to Pay",
          },
          {
            title: "File types",
            status: "Not applicable",
            message: "Your flow is not using FileUpload or UploadAndLabel",
          },
          {
            title: "Project types",
            status: "Not applicable",
            message:
              'Your flow is not using Checklists which set "proposal.projectType"',
          },
          {
            title: "Templated nodes",
            status: "Not applicable",
            message: "This is not a templated flow",
          },
        ]);
      });
  });
});

describe("templated node requirements validation on diff", () => {
  it("fails if all required templated nodes have not been customised", async () => {
    const alteredFlow = {
      ...mockFlowData,
      PlanningConstraints: {
        type: 11,
        data: {
          title: "Check all constraints",
          fn: "property.constraints.planning",
          isTemplatedNode: true,
          templatedNodeInstructions:
            "Select which datasets you'd like to query or update your disclaimer",
          areTemplatedNodeInstructionsRequired: true,
        },
      },
    };

    queryMock.mockQuery({
      name: "GetFlowData",
      matchOnVariables: false,
      data: {
        flow: {
          data: alteredFlow,
          slug: "altered-flow-name",
          team_id: 1,
          team: {
            slug: "testing",
          },
          publishedFlows: [{ data: alteredFlow }],
        },
      },
    });

    queryMock.mockQuery({
      name: "GetTemplatedFlowEdits",
      matchOnVariables: false,
      data: {
        flow: {
          templatedFrom: "source-flow-1",
          edits: {
            data: {
              someOtherNode: {
                data: {
                  title: "Updated title",
                },
              },
            },
          },
        },
      },
    });

    await supertest(app)
      .post("/flows/1/diff")
      .set(auth)
      .expect(200)
      .then((res) => {
        expect(res.body.message).toEqual("Changes queued to publish");
        expect(res.body.validationChecks).toEqual([
          {
            title: "Templated nodes",
            status: "Fail",
            message: `Customise each "Required" node before publishing your templated flow`,
          },
          {
            title: "Sections",
            status: "Pass",
            message: "Your flow has valid Sections",
          },
          {
            title: "Planning Constraints",
            status: "Pass",
            message: "Your flow has valid Planning Constraints",
          },
          {
            title: "Fees",
            status: "Not applicable",
            message: "Your flow is not using Pay",
          },
          {
            title: "Invite to Pay",
            status: "Not applicable",
            message: "Your flow is not using Invite to Pay",
          },
          {
            title: "File types",
            status: "Not applicable",
            message: "Your flow is not using FileUpload or UploadAndLabel",
          },
          {
            title: "Project types",
            status: "Not applicable",
            message:
              'Your flow is not using Checklists which set "proposal.projectType"',
          },
        ]);
      });
  });

  it("passes when all required templated nodes have been customised", async () => {
    const alteredFlow = {
      ...mockFlowData,
      PlanningConstraints: {
        type: 11,
        data: {
          title: "Check all constraints",
          fn: "property.constraints.planning",
          isTemplatedNode: true,
          templatedNodeInstructions:
            "Select which datasets you'd like to query or update your disclaimer",
          areTemplatedNodeInstructionsRequired: true,
        },
      },
    };

    queryMock.mockQuery({
      name: "GetFlowData",
      matchOnVariables: false,
      data: {
        flow: {
          data: alteredFlow,
          slug: "altered-flow-name",
          team_id: 1,
          team: {
            slug: "testing",
          },
          publishedFlows: [{ data: alteredFlow }],
        },
      },
    });

    queryMock.mockQuery({
      name: "GetTemplatedFlowEdits",
      matchOnVariables: false,
      data: {
        flow: {
          templatedFrom: "source-flow-1",
          edits: {
            data: {
              PlanningConstraints: {
                data: {
                  disclaimer: "May not be accurate!",
                },
              },
            },
          },
        },
      },
    });

    await supertest(app)
      .post("/flows/1/diff")
      .set(auth)
      .expect(200)
      .then((res) => {
        expect(res.body.message).toEqual("Changes queued to publish");
        expect(res.body.validationChecks).toEqual([
          {
            title: "Sections",
            status: "Pass",
            message: "Your flow has valid Sections",
          },
          {
            title: "Planning Constraints",
            status: "Pass",
            message: "Your flow has valid Planning Constraints",
          },
          {
            title: "Templated nodes",
            status: "Pass",
            message: `All "Required" nodes in your templated flow have been customised`,
          },
          {
            title: "Fees",
            status: "Not applicable",
            message: "Your flow is not using Pay",
          },
          {
            title: "Invite to Pay",
            status: "Not applicable",
            message: "Your flow is not using Invite to Pay",
          },
          {
            title: "File types",
            status: "Not applicable",
            message: "Your flow is not using FileUpload or UploadAndLabel",
          },
          {
            title: "Project types",
            status: "Not applicable",
            message:
              'Your flow is not using Checklists which set "proposal.projectType"',
          },
        ]);
      });
  });
});

describe("flow comments since last publish", () => {
  it("returns recent comments if there are changes to publish", async () => {
    const alteredFlow = {
      ...mockFlowData,
      externalPortalNodeId: {
        edges: ["newSectionNodeId"],
        type: 310,
      },
      newSectionNodeId: {
        type: 360,
      },
    };

    queryMock.mockQuery({
      name: "GetFlowData",
      matchOnVariables: false,
      data: {
        flow: {
          data: alteredFlow,
          slug: "altered-flow-name",
          team_id: 1,
          team: {
            slug: "testing",
          },
          publishedFlows: [{ data: alteredFlow }],
        },
      },
    });

    await supertest(app)
      .post("/flows/1/diff")
      .set(auth)
      .expect(200)
      .then((res) => {
        expect(res.body.message).toEqual("Changes queued to publish");
        expect(res.body.history).toEqual([
          {
            id: 1,
            createdAt: "2025-01-01",
            firstName: "Test",
            lastName: "Editor",
            type: "comment",
            data: null,
            comment: "Changed order of about the applicant questions",
          },
        ]);
      });
  });

  it("returns no comments if there are no changes to publish", async () => {
    await supertest(app)
      .post("/flows/1/diff")
      .set(auth)
      .expect(200)
      .then((res) => {
        expect(res.body.message).toEqual("No new changes to publish");
        expect(res.body.history).toBeNull();
      });
  });
});

describe("an unpublished flow", () => {
  test("it returns no history", async () => {
    queryMock.mockQuery({
      name: "GetMostRecentPublishedFlowVersion",
      matchOnVariables: false,
      data: {
        flow: {
          publishedFlows: [],
        },
      },
    });

    const alteredFlow = {
      ...mockFlowData,
      externalPortalNodeId: {
        edges: ["newSectionNodeId"],
        type: 310,
      },
      newSectionNodeId: {
        type: 360,
      },
    };

    queryMock.mockQuery({
      name: "GetFlowData",
      matchOnVariables: false,
      data: {
        flow: {
          data: alteredFlow,
          slug: "altered-flow-name",
          team_id: 1,
          team: {
            slug: "testing",
          },
          publishedFlows: [{ data: alteredFlow }],
        },
      },
    });

    await supertest(app)
      .post("/flows/1/diff")
      .set(auth)
      .expect(200)
      .then((res) => {
        expect(res.body.message).toEqual("Changes queued to publish");
        expect(res.body.history).toBeNull();
      });
  });
});
