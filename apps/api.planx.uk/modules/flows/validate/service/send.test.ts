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
  const result = validateSend(validFlattenedSendFlow);

  expect(result.status).toEqual("Pass");
  expect(result.message).toEqual("Flow does not have extra Send components");
});

test("Passes when there is 0 Sends", () => {
  const result = validateSend(validFlattenedNoSendFlow);

  expect(result.status).toEqual("Pass");
  expect(result.message).toEqual("Flow does not have extra Send components");
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

const validFlattenedSendFlow = {
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

const validFlattenedNoSendFlow: FlowGraph = {
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
