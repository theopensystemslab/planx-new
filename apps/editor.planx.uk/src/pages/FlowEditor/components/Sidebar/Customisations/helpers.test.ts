import { sortFlow } from "@opensystemslab/planx-core";
import type { FlowGraph } from "@opensystemslab/planx-core/types";
import { ComponentType } from "@opensystemslab/planx-core/types";

import { getEditedFolderIds, hasNodeBeenUpdated } from "./helpers";
import type { FlowEdits } from "./types";

describe("getEditedFolderIds", () => {
  it("returns the folder containing an edited node", () => {
    const editedFolderIds = getEditedFolderIds(
      mockFlowEdits,
      sortFlow(mockTemplatedFlow),
    );
    expect(editedFolderIds).toEqual(new Set(["Folder"]));
  });

  it("returns every folder containing an edited node nested within folders", () => {
    const editedFolderIds = getEditedFolderIds(
      { NestedNotice: { data: { text: "Updated" } } },
      sortFlow(mockNestedFolderFlow),
    );
    expect(editedFolderIds).toEqual(new Set(["FolderA", "FolderB"]));
  });

  it("does not return a folder if only the folder itself has been edited", () => {
    const editedFolderIds = getEditedFolderIds(
      { FolderB: { data: { text: "Updated" } } },
      sortFlow(mockNestedFolderFlow),
    );
    expect(editedFolderIds).toEqual(new Set(["FolderA"]));
  });

  it("returns no folders when there are no edits", () => {
    const editedFolderIds = getEditedFolderIds(
      {},
      sortFlow(mockNestedFolderFlow),
    );
    expect(editedFolderIds.size).toBe(0);
  });

  it("returns no folders when orderedFlow is unavailable", () => {
    const editedFolderIds = getEditedFolderIds(mockFlowEdits, undefined);
    expect(editedFolderIds.size).toBe(0);
  });
});

describe("hasNodeBeenUpdated", () => {
  it("returns true for a templated node that has been directly edited", () => {
    const isComplete = hasNodeBeenUpdated(
      "SectionTwo",
      mockTemplatedFlow,
      mockFlowEdits,
      getEditedFolderIds(mockFlowEdits, sortFlow(mockTemplatedFlow)),
    );
    expect(isComplete).toBe(true);
  });

  it("returns true if the option of a required Question node has been edited", () => {
    const isComplete = hasNodeBeenUpdated(
      "Question",
      mockTemplatedFlow,
      mockFlowEdits,
      getEditedFolderIds(mockFlowEdits, sortFlow(mockTemplatedFlow)),
    );
    expect(isComplete).toBe(true);
  });

  it("returns true if a node has been added to a templated folder", () => {
    const isComplete = hasNodeBeenUpdated(
      "Folder",
      mockTemplatedFlow,
      mockFlowEdits,
      getEditedFolderIds(mockFlowEdits, sortFlow(mockTemplatedFlow)),
    );
    expect(isComplete).toBe(true);
  });

  it("returns true for a folder if a node has been added to a folder nested within it", () => {
    const flowEdits: FlowEdits = {
      NestedNotice: { data: { text: "Updated" } },
    };
    const isComplete = hasNodeBeenUpdated(
      "FolderA",
      mockNestedFolderFlow,
      flowEdits,
      getEditedFolderIds(flowEdits, sortFlow(mockNestedFolderFlow)),
    );
    expect(isComplete).toBe(true);
  });

  it("returns false for a folder if none of its children have been edited", () => {
    const isComplete = hasNodeBeenUpdated(
      "FolderA",
      mockNestedFolderFlow,
      {},
      getEditedFolderIds({}, sortFlow(mockNestedFolderFlow)),
    );
    expect(isComplete).toBe(false);
  });

  it("returns false if a templated node has not been edited", () => {
    const isComplete = hasNodeBeenUpdated(
      "Content",
      mockTemplatedFlow,
      mockFlowEdits,
      getEditedFolderIds(mockFlowEdits, sortFlow(mockTemplatedFlow)),
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
    type: ComponentType.Content,
  },
};

const mockNestedFolderFlow: FlowGraph = {
  _root: {
    edges: ["FolderA"],
  },
  FolderA: {
    type: ComponentType.InternalPortal,
    data: {
      text: "Outer folder",
      isTemplatedNode: true,
      areTemplatedNodeInstructionsRequired: true,
    },
    edges: ["FolderB"],
  },
  FolderB: {
    type: ComponentType.InternalPortal,
    data: {
      text: "Inner folder",
    },
    edges: ["NestedNotice"],
  },
  NestedNotice: {
    type: ComponentType.Content,
    data: {
      text: "Notice inside a folder inside a folder",
    },
  },
};
