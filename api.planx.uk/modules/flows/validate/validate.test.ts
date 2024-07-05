import supertest from "supertest";

import { queryMock } from "../../../tests/graphqlQueryMock";
import { authHeader, getJWT } from "../../../tests/mockJWT";
import app from "../../../server";
import { flowWithInviteToPay } from "../../../tests/mocks/inviteToPayData";
import { userContext } from "../../auth/middleware";
import { FlowGraph } from "@opensystemslab/planx-core/types";
import { mockFlowData } from "../../../tests/mocks/validateAndPublishMocks";

beforeAll(() => {
  const getStoreMock = jest.spyOn(userContext, "getStore");
  getStoreMock.mockReturnValue({
    user: {
      sub: "123",
      jwt: getJWT({ role: "teamEditor" }),
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
    name: "PublishFlow",
    matchOnVariables: false,
    data: {
      publishedFlow: {
        data: mockFlowData,
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
            title: "Invite to Pay",
            status: "Not applicable",
            message: "Your flow is not using Invite to Pay",
          },
          {
            title: "File types",
            status: "Not applicable",
            message: "Your flow is not using FileUpload or UploadAndLabel",
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
            title: "Invite to Pay",
            status: "Not applicable",
            message: "Your flow is not using Invite to Pay",
          },
          {
            title: "File types",
            status: "Not applicable",
            message: "Your flow is not using FileUpload or UploadAndLabel",
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
            title: "Sections",
            status: "Not applicable",
            message: "Your flow is not using Sections",
          },
          {
            title: "File types",
            status: "Not applicable",
            message: "Your flow is not using FileUpload or UploadAndLabel",
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
            title: "Sections",
            status: "Not applicable",
            message: "Your flow is not using Sections",
          },
          {
            title: "File types",
            status: "Not applicable",
            message: "Your flow is not using FileUpload or UploadAndLabel",
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
            title: "Sections",
            status: "Not applicable",
            message: "Your flow is not using Sections",
          },
          {
            title: "File types",
            status: "Not applicable",
            message: "Your flow is not using FileUpload or UploadAndLabel",
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
            title: "Sections",
            status: "Not applicable",
            message: "Your flow is not using Sections",
          },
          {
            title: "File types",
            status: "Not applicable",
            message: "Your flow is not using FileUpload or UploadAndLabel",
          },
        ]);
      });
  });

  it("does not update if invite to pay is enabled, but there is not a Checklist that sets `proposal.projectType`", async () => {
    const {
      Checklist: _Checklist,
      ChecklistOptionOne: _ChecklistOptionOne,
      ChecklistOptionTwo: _ChecklistOptionTwo,
      ...invalidatedFlow
    } = flowWithInviteToPay;
    invalidatedFlow["_root"].edges?.splice(
      invalidatedFlow["_root"].edges?.indexOf("Checklist"),
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
              "When using Invite to Pay, your flow must have a Checklist that sets `proposal.projectType`",
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
        ]);
      });
  });
});

describe("ODP Schema file type validation on diff", () => {
  it("warns if any file data fields aren't supported by the ODP Schema", async () => {
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
            status: "Warn",
            message:
              "Your FileUpload or UploadAndLabel are setting data fields that are not supported by the ODP Schema: sitePlanTypo",
          },
          {
            title: "Sections",
            status: "Pass",
            message: "Your flow has valid Sections",
          },
          {
            title: "Invite to Pay",
            status: "Not applicable",
            message: "Your flow is not using Invite to Pay",
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
            title: "Invite to Pay",
            status: "Not applicable",
            message: "Your flow is not using Invite to Pay",
          },
        ]);
      });
  });
});
