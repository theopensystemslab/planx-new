import type { Store } from "..";
import { showNoteInTemplatedFlow } from "./showNoteInTemplatedFlow";

describe("showNoteInTemplatedFlow for standalone notes", () => {
  it("hides a standalone note component on the root", () => {
    const showNote = showNoteInTemplatedFlow("NoteOnRoot", mockTemplatedFlow);
    expect(showNote).toEqual(false);
  });

  it("hides a standalone note component in a non-templated folder", () => {
    const showNote = showNoteInTemplatedFlow("NoteInFolder", mockTemplatedFlow);
    expect(showNote).toEqual(false);
  });

  it("shows a standalone note in a templated folder", () => {
    const showNote = showNoteInTemplatedFlow(
      "NoteInTemplatedFolder",
      mockTemplatedFlow,
    );
    expect(showNote).toEqual(true);
  });
});

describe("showNoteInTemplatedFlow for attached notes", () => {
  it("hides notes attached to non-templated nodes", () => {
    const showNote = showNoteInTemplatedFlow(
      "SectionWithAttachedNote",
      mockTemplatedFlow,
    );
    expect(showNote).toEqual(false);
  });

  it("shows notes attached to templated nodes", () => {
    const showNote = showNoteInTemplatedFlow(
      "TemplatedFolder",
      mockTemplatedFlow,
    );
    expect(showNote).toEqual(true);
  });

  it("shows notes attached to non-templated nodes inside of templated folders", () => {
    const showNote = showNoteInTemplatedFlow(
      "QuestionWithAttachedNoteInTemplatedFolder",
      mockTemplatedFlow,
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
