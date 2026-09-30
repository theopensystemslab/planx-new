import { sortFlow } from "@opensystemslab/planx-core";
import type { FlowGraph } from "@opensystemslab/planx-core/types";
import { ComponentType } from "@opensystemslab/planx-core/types";

import { hasNodeBeenUpdated } from "./helpers";
import type { FlowEdits } from "./types";

describe("hasNodeBeenUpdated", () => {
  it("returns true for a templated node that has been directly edited", () => {
    const isComplete = hasNodeBeenUpdated(
      "SectionTwo",
      mockTemplatedFlow,
      mockFlowEdits,
      sortFlow(mockTemplatedFlow),
    );
    expect(isComplete).toBe(true);
  });

  it("returns true if the option of a required Question node has been edited", () => {
    const isComplete = hasNodeBeenUpdated(
      "Question",
      mockTemplatedFlow,
      mockFlowEdits,
      sortFlow(mockTemplatedFlow),
    );
    expect(isComplete).toBe(true);
  });

  it("returns true if a node has been added to a templated folder", () => {
    const isComplete = hasNodeBeenUpdated(
      "Folder",
      mockTemplatedFlow,
      mockFlowEdits,
      sortFlow(mockTemplatedFlow),
    );
    expect(isComplete).toBe(true);
  });

  it("returns false if a templated node has not been edited", () => {
    const isComplete = hasNodeBeenUpdated(
      "Content",
      mockTemplatedFlow,
      mockFlowEdits,
      sortFlow(mockTemplatedFlow),
    );
    expect(isComplete).toBe(false);
  });
});

const mockFlowEdits: FlowEdits = {
  QuestionOptionA: {
    // "Completes" Question
    data: {
      val: "Southwark",
    },
  },
  SectionTwo: {
    data: {
      notes: "Added a note",
    },
  },
  Notice: {
    // "Completes" Folder
    data: {
      tags: ["toReview"],
    },
  },
};

const mockTemplatedFlow: FlowGraph = {
  _root: {
    edges: ["SectionOne", "SectionTwo", "Question"],
  },
  SectionOne: {
    type: ComponentType.Section,
    data: {
      title: "Non-customisable section",
      length: "short",
      tags: [],
    },
  },
  SectionTwo: {
    type: ComponentType.Section,
    data: {
      title: "Customisable section",
      length: "short",
      isTemplatedNode: true,
      templatedNodeInstructions: "Change the title (optional)",
    },
  },
  Question: {
    type: ComponentType.Question,
    data: {
      neverAutoAnswer: false,
      alwaysAutoAnswerBlank: false,
      text: "Which option?",
      tags: [],
      isTemplatedNode: true,
      templatedNodeInstructions: "Update the title",
      areTemplatedNodeInstructionsRequired: true,
    },
    edges: ["QuestionOptionA", "QuestionOptionB"],
  },
  QuestionOptionA: {
    type: ComponentType.Answer,
    data: {
      text: "Yes",
    },
    edges: ["Content"],
  },
  QuestionOptionB: {
    type: ComponentType.Answer,
    data: {
      text: "No",
    },
    edges: ["Folder"],
  },
  Content: {
    type: ComponentType.Content,
    data: {
      content: "<h1>This is a test</h1><p></p>",
      resetButton: false,
      isTemplatedNode: true,
      templatedNodeInstructions: "Update the content",
      areTemplatedNodeInstructionsRequired: true,
    },
  },
  Folder: {
    type: ComponentType.InternalPortal,
    data: {
      text: "Customisable folder with default content",
      isTemplatedNode: true,
    },
    edges: ["Checklist"],
  },
  Checklist: {
    type: ComponentType.Checklist,
    data: {
      allRequired: false,
      neverAutoAnswer: false,
      alwaysAutoAnswerBlank: false,
      text: "Is this a nested checklist?",
    },
    edges: ["ChecklistOptionA", "ChecklistOptionB"],
  },
  ChecklistOptionA: {
    data: {
      text: "Yes",
    },
    type: ComponentType.Answer,
    edges: ["Notice"],
  },
  ChecklistOptionB: {
    data: {
      text: "Definitely",
    },
    type: ComponentType.Answer,
  },
  Notice: {
    data: {
      text: "Notice inside a customisable folder not on root branch",
    },
    type: ComponentType.Notice,
  },
};
