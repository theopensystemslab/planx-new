import type { OrderedFlow } from "@opensystemslab/planx-core/types";

import type { Store } from "..";
import { showNoteInTemplatedFlow } from "./showNoteInTemplatedFlow";

describe("showNoteInTemplatedFlow for standalone notes", () => {
  it("hides a standalone note component on the root", () => {
    const showNote = showNoteInTemplatedFlow(
      "NoteOnRoot",
      mockTemplatedFlow,
      mockOrderedFlow,
    );
    expect(showNote).toEqual(false);
  });

  it("hides a standalone note component in a non-templated folder", () => {
    const showNote = showNoteInTemplatedFlow(
      "NoteInFolder",
      mockTemplatedFlow,
      mockOrderedFlow,
    );
    expect(showNote).toEqual(false);
  });

  it("shows a standalone note in a templated folder", () => {
    const showNote = showNoteInTemplatedFlow(
      "NoteInTemplatedFolder",
      mockTemplatedFlow,
      mockOrderedFlow,
    );
    expect(showNote).toEqual(true);
  });
});

describe("showNoteInTemplatedFlow for attached notes", () => {
  it("hides notes attached to non-templated nodes", () => {
    const showNote = showNoteInTemplatedFlow(
      "SectionWithAttachedNote",
      mockTemplatedFlow,
      mockOrderedFlow,
    );
    expect(showNote).toEqual(false);
  });

  it("shows notes attached to templated nodes", () => {
    const showNote = showNoteInTemplatedFlow(
      "TemplatedFolder",
      mockTemplatedFlow,
      mockOrderedFlow,
    );
    expect(showNote).toEqual(true);
  });

  it("shows notes attached to non-templated nodes inside of templated folders", () => {
    const showNote = showNoteInTemplatedFlow(
      "QuestionWithAttachedNoteInTemplatedFolder",
      mockTemplatedFlow,
      mockOrderedFlow,
    );
    expect(showNote).toEqual(true);
  });
});

const mockTemplatedFlow: Store.Flow = {
  _root: {
    edges: [
      "SectionWithAttachedNote",
      "NoteOnRoot",
      "Folder",
      "TemplatedFolder",
    ],
  },
  Folder: {
    data: {
      text: "Non-customisable folder",
    },
    type: 300,
    edges: ["QuestionWithAttachedNote", "NoteInFolder"],
  },
  NoteInTemplatedFolder: {
    data: {
      text: "Standalone note",
    },
    type: 999,
  },
  NoteInFolder: {
    data: {
      text: "Standalone note",
    },
    type: 999,
  },
  QuestionWithAttachedNoteInTemplatedFolder: {
    data: {
      text: "In folder",
      notes: "Note",
      neverAutoAnswer: false,
      alwaysAutoAnswerBlank: false,
    },
    type: 100,
    edges: ["rOXNDec2pu"],
  },
  TemplatedFolder: {
    data: {
      text: "Customisable folder",
      isTemplatedNode: true,
      notes: "This is a note about the folder",
    },
    type: 300,
    edges: [
      "QuestionWithAttachedNoteInTemplatedFolder",
      "NoteInTemplatedFolder",
    ],
  },
  NoteOnRoot: {
    data: {
      text: "Standalone note",
    },
    type: 999,
  },
  SectionWithAttachedNote: {
    data: {
      notes: "Internal note",
      title: "Section one",
      length: "medium",
    },
    type: 360,
  },
  pb20UZVXVv: {
    data: {
      text: "Ok",
    },
    type: 200,
  },
  rOXNDec2pu: {
    data: {
      text: "Ok",
    },
    type: 200,
  },
  QuestionWithAttachedNote: {
    data: {
      text: "In folder",
      notes: "Note",
      neverAutoAnswer: false,
      alwaysAutoAnswerBlank: false,
    },
    type: 100,
    edges: ["pb20UZVXVv"],
  },
};

const mockOrderedFlow: OrderedFlow = [
  {
    id: "SectionWithAttachedNote",
    parentId: "_root",
    type: 360,
    data: {
      notes: "Internal note",
      title: "Section one",
      length: "medium",
    },
    sectionId: "SectionWithAttachedNote",
  },
  {
    id: "NoteOnRoot",
    parentId: "_root",
    type: 999,
    data: {
      text: "Standalone note",
    },
    sectionId: "SectionWithAttachedNote",
  },
  {
    id: "Folder",
    parentId: "_root",
    type: 300,
    data: {
      text: "Non-customisable folder",
    },
    edges: ["QuestionWithAttachedNote", "NoteInFolder"],
    sectionId: "SectionWithAttachedNote",
  },
  {
    id: "QuestionWithAttachedNote",
    parentId: "Folder",
    type: 100,
    data: {
      text: "In folder",
      notes: "Note",
      neverAutoAnswer: false,
      alwaysAutoAnswerBlank: false,
    },
    edges: ["pb20UZVXVv"],
    sectionId: "SectionWithAttachedNote",
    internalPortalId: "Folder",
  },
  {
    id: "pb20UZVXVv",
    parentId: "QuestionWithAttachedNote",
    type: 200,
    data: {
      text: "Ok",
    },
    sectionId: "SectionWithAttachedNote",
    internalPortalId: "Folder",
  },
  {
    id: "NoteInFolder",
    parentId: "Folder",
    type: 999,
    data: {
      text: "Standalone note",
    },
    sectionId: "SectionWithAttachedNote",
    internalPortalId: "Folder",
  },
  {
    id: "TemplatedFolder",
    parentId: "_root",
    type: 300,
    data: {
      text: "Customisable folder",
      isTemplatedNode: true,
      notes: "This is a note about the folder",
    },
    edges: [
      "QuestionWithAttachedNoteInTemplatedFolder",
      "NoteInTemplatedFolder",
    ],
    sectionId: "SectionWithAttachedNote",
  },
  {
    id: "QuestionWithAttachedNoteInTemplatedFolder",
    parentId: "TemplatedFolder",
    type: 100,
    data: {
      text: "In folder",
      notes: "Note",
      neverAutoAnswer: false,
      alwaysAutoAnswerBlank: false,
    },
    edges: ["rOXNDec2pu"],
    sectionId: "SectionWithAttachedNote",
    internalPortalId: "TemplatedFolder",
  },
  {
    id: "rOXNDec2pu",
    parentId: "QuestionWithAttachedNoteInTemplatedFolder",
    type: 200,
    data: {
      text: "Ok",
    },
    sectionId: "SectionWithAttachedNote",
    internalPortalId: "TemplatedFolder",
  },
  {
    id: "NoteInTemplatedFolder",
    parentId: "TemplatedFolder",
    type: 999,
    data: {
      text: "Standalone note",
    },
    sectionId: "SectionWithAttachedNote",
    internalPortalId: "TemplatedFolder",
  },
];
