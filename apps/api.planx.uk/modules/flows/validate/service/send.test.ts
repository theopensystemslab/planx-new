import type { FlowGraph } from "@opensystemslab/planx-core/types";
import { validateSend } from "./send.js";
import { ComponentType } from "@opensystemslab/planx-core/types";

test("Fails when there are >1 Send", () => {
  const result = validateSend(invalidFlattenedFlow);

  expect(result.status).toEqual("Fail");
  expect(result.message).toEqual(
    "Flows cannot have more than one Send component",
  );
});

test("Passes when there is 1 Send", () => {
  const result = validateSend(validFlattenedFlow);

  expect(result.status).toEqual("Pass");
  expect(result.message).toEqual(
    "Flow correctly has exactly one Send component",
  );
});

test("Not applicable when there are 0 Sends", () => {
  const result = validateSend(notApplicableFlattenedFlow);

  expect(result.status).toEqual("Not applicable");
  expect(result.message).toEqual("Your flow is not a submission service");
});

const invalidFlattenedFlow: FlowGraph = {
  _root: {
    edges: ["Send", "SendInFolder"],
  },
  Send: {
    data: {
      title: "Send",
    },
    type: 650,
  },
  FolderWithSend: {
    data: {
      text: "Folder",
    },
    type: 300,
    edges: ["SendInFolder"],
  },
  SendInFolder: {
    data: {
      title: "Send",
    },
    type: 650,
  },
};

const validFlattenedFlow = {
  _root: {
    edges: ["Send"],
  },
  Send: {
    data: {
      title: "Send",
    },
    type: 650,
  },
};

const notApplicableFlattenedFlow: FlowGraph = {
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
      isTemplatedNode: false,
      neverAutoAnswer: false,
      alwaysAutoAnswerBlank: true,
      templatedNodeInstructions: "",
      areTemplatedNodeInstructionsRequired: false,
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
