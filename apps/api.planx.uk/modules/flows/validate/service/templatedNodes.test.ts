import { ComponentType } from "@opensystemslab/planx-core/types";
import { queryMock } from "../../../../tests/graphqlQueryMock.js";
import { validateTemplatedNodes } from "./templatedNodes.js";
import { userContext } from "../../../auth/middleware.js";
import { getTestJWT } from "../../../../tests/mockJWT.js";

beforeAll(() => {
  const getStoreMock = vi.spyOn(userContext, "getStore");
  getStoreMock.mockReturnValue({
    user: {
      sub: "123",
      jwt: getTestJWT({ role: "teamEditor" }),
    },
  });
});

test("returns status 'Not applicable' if this is not a templated flow", async () => {
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

  const result = await validateTemplatedNodes(
    "templated-flow-123",
    mockTemplatedFlow,
  );
  expect(result).toEqual({
    title: "Templated nodes",
    status: "Not applicable",
    message: "This is not a templated flow",
  });
});

test("returns status 'Fail' if no required nodes have been edited", async () => {
  queryMock.mockQuery({
    name: "GetTemplatedFlowEdits",
    matchOnVariables: false,
    data: {
      flow: {
        templatedFrom: "source-template-123",
        edits: { data: {} },
      },
    },
  });

  const result = await validateTemplatedNodes(
    "templated-flow-123",
    mockTemplatedFlow,
  );
  expect(result).toEqual({
    title: "Templated nodes",
    status: "Fail",
    message: `Customise each "Required" node before publishing your templated flow`,
  });
});

test("returns status 'Pass' if the required node has been directly edited", async () => {
  queryMock.mockQuery({
    name: "GetTemplatedFlowEdits",
    matchOnVariables: false,
    data: {
      flow: {
        templatedFrom: "source-template-123",
        edits: { data: mockEditParent },
      },
    },
  });

  const result = await validateTemplatedNodes(
    "templated-flow-123",
    mockTemplatedFlow,
  );
  expect(result).toEqual({
    title: "Templated nodes",
    status: "Pass",
    message: `All "Required" nodes in your templated flow have been customised`,
  });
});

test("returns status 'Pass' if the child of a required node has been edited", async () => {
  queryMock.mockQuery({
    name: "GetTemplatedFlowEdits",
    matchOnVariables: false,
    data: {
      flow: {
        templatedFrom: "source-template-123",
        edits: { data: mockEditOption },
      },
    },
  });

  const result = await validateTemplatedNodes(
    "templated-flow-123",
    mockTemplatedFlow,
  );
  expect(result).toEqual({
    title: "Templated nodes",
    status: "Pass",
    message: `All "Required" nodes in your templated flow have been customised`,
  });
});

const mockTemplatedFlow = {
  _root: {
    edges: ["Question"],
  },
  Question: {
    data: {
      fn: "property.localAuthorityDistrict",
      tags: [],
      text: "Is the property in the council?",
      description:
        "<p>This question refers to the local planning authority (LPA)</p>",
      isTemplatedNode: true,
      neverAutoAnswer: false,
      alwaysAutoAnswerBlank: true,
      templatedNodeInstructions:
        "You need to replace the Data field of the 'Yes' option with your council name in capital case.",
      areTemplatedNodeInstructionsRequired: true,
    },
    type: ComponentType.Question,
    edges: ["YesOption", "NoOption"],
  },
  YesOption: {
    data: {
      val: "Write your data field here",
      text: "Yes",
    },
    type: 200,
  },
  NoOption: {
    data: {
      text: "No",
    },
    type: 200,
  },
};

const mockEditParent = {
  Question: {
    data: {
      description: "New description",
    },
  },
};

const mockEditOption = {
  YesOption: {
    data: {
      val: "Southwark",
    },
  },
};
