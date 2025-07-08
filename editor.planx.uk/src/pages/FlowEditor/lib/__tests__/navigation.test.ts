import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";

import { FullStore, useStore } from "../store";
import flowWithoutSections from "./mocks/flowWithClones.json";
import flowWithSectionsInFolders from "./mocks/flowWithSectionsInFolders.json";
import flowWithThreeSections from "./mocks/flowWithThreeSections.json";

const { getState, setState } = useStore;
const { filterFlowByType, initNavigationStore, record } = getState();

let initialState: FullStore;

beforeEach(() => {
  initialState = getState();
});

afterEach(() => setState(initialState));

describe("filterFlowByType()", () => {
  test("correctly returns a filtered view of a flow without sections", () => {
    setState({ flow: flowWithoutSections });

    // No Sections in test flow
    const sectionResult = filterFlowByType(TYPES.Section);
    expect(Object.keys(sectionResult)).toEqual([]);
  });

  test("correctly returns a filtered view of a flow with sections", () => {
    setState({ flow: flowWithThreeSections });

    // Three Sections in test flow
    const sectionResult = filterFlowByType(TYPES.Section);
    expect(Object.keys(sectionResult)).toEqual(
      expect.arrayContaining(["firstSection", "secondSection", "thirdSection"]),
    );

    // Three Statements in test flow
    const statementResult = filterFlowByType(TYPES.Question);
    expect(Object.keys(statementResult)).toEqual(
      expect.arrayContaining([
        "firstQuestion",
        "secondQuestion",
        "thirdQuestion",
      ]),
    );

    // No FileUpload in test flow
    const uploadResult = filterFlowByType(TYPES.FileUpload);
    expect(Object.keys(uploadResult).length).toBe(0);
  });

  test("correctly returns a filtered view of a flow with sections in folders", () => {
    setState({ flow: flowWithSectionsInFolders });

    // Three sections in test flow
    const sectionResult = filterFlowByType(TYPES.Section);
    expect(Object.keys(sectionResult)).toEqual(
      expect.arrayContaining([
        "FirstSection",
        "MiddleSectionInFolder",
        "FinalSection",
      ]),
    );

    // Two folders in test flow
    const folderResult = filterFlowByType(TYPES.InternalPortal);
    expect(Object.keys(folderResult)).toEqual(
      expect.arrayContaining(["FolderOnBranch", "FolderOnRoot"]),
    );

    // No FileUpload in test flow
    const uploadResult = filterFlowByType(TYPES.FileUpload);
    expect(Object.keys(uploadResult).length).toBe(0);
  });
});

describe("initNavigationStore()", () => {
  test("sets expected initial values for flow without sections", () => {
    setState({ flow: flowWithoutSections });
    let sectionCount, currentSectionTitle, sectionNodes;

    ({ sectionCount, currentSectionTitle, sectionNodes } = getState());
    expect(sectionCount).toBe(0);
    expect(currentSectionTitle).toBeUndefined();
    expect(Object.keys(sectionNodes).length).toBe(0);

    initNavigationStore();

    ({ sectionCount, currentSectionTitle, sectionNodes } = getState());
    expect(sectionCount).toBe(0);
    expect(currentSectionTitle).toBeUndefined();
    expect(Object.keys(sectionNodes).length).toBe(0);
  });

  test("sets expected initial values for flow with sections", () => {
    setState({ flow: flowWithThreeSections });
    let sectionCount, currentSectionTitle, sectionNodes;

    ({ sectionCount, currentSectionTitle, sectionNodes } = getState());
    expect(sectionCount).toBe(0);
    expect(currentSectionTitle).toBeUndefined();
    expect(Object.keys(sectionNodes).length).toBe(0);

    initNavigationStore();

    ({ sectionCount, currentSectionTitle, sectionNodes } = getState());
    expect(sectionCount).toBe(3);
    expect(currentSectionTitle).toBe("First section");
    expect(Object.keys(sectionNodes)).toEqual(
      expect.arrayContaining(["firstSection", "secondSection", "thirdSection"]),
    );
  });

  test("sets expected initial values for flow with sections in folders", () => {
    setState({ flow: flowWithSectionsInFolders });
    let sectionCount, currentSectionTitle, sectionNodes;

    ({ sectionCount, currentSectionTitle, sectionNodes } = getState());
    expect(sectionCount).toBe(0);
    expect(currentSectionTitle).toBeUndefined();
    expect(Object.keys(sectionNodes).length).toBe(0);

    initNavigationStore();

    ({ sectionCount, currentSectionTitle, sectionNodes } = getState());
    expect(sectionCount).toBe(3);
    expect(currentSectionTitle).toBe("First");
    expect(Object.keys(sectionNodes)).toEqual(
      expect.arrayContaining([
        "FirstSection",
        "MiddleSectionInFolder",
        "FinalSection",
      ]),
    );
  });
});

describe("updateSectionData() on forwards navigation", () => {
  test("does not update state if there are no sections in the flow", () => {
    setState({ flow: flowWithoutSections });
    initNavigationStore();

    let currentSectionTitle, currentSectionIndex;
    ({ currentSectionTitle, currentSectionIndex } = getState());
    expect(currentSectionIndex).toBe(1);
    expect(currentSectionTitle).toBeUndefined();

    // Navigate forward, which calls updateSectionData()
    record("question", { answers: ["leftChoice"] });
    record("leftChoice", { answers: ["leftNotice"] });

    ({ currentSectionTitle, currentSectionIndex } = getState());
    expect(currentSectionIndex).toBe(1);
    expect(currentSectionTitle).toBeUndefined();
  });

  test("updates section title and index correctly for a flow with sections", () => {
    let currentSectionTitle, currentSectionIndex;
    setState({ flow: flowWithThreeSections });
    initNavigationStore();

    // First section correctly set on initial load
    ({ currentSectionTitle, currentSectionIndex } = getState());
    expect(currentSectionIndex).toBe(1);
    expect(currentSectionTitle).toEqual("First section");

    // Navigate into first section
    record("firstSection", { auto: true });

    // First section is still correctly set
    ({ currentSectionTitle, currentSectionIndex } = getState());
    expect(currentSectionIndex).toBe(1);
    expect(currentSectionTitle).toEqual("First section");

    // Navigate into second section
    record("firstQuestion", { answers: ["firstAnswer"] });
    record("secondSection", { auto: true });

    // Second section is correctly set
    ({ currentSectionTitle, currentSectionIndex } = getState());
    expect(currentSectionIndex).toBe(2);
    expect(currentSectionTitle).toEqual("Second section");

    // Navigate into third section
    record("secondQuestion", { answers: ["secondAnswer"] });
    record("thirdSection", { auto: true });

    // Third section is correctly set
    ({ currentSectionTitle, currentSectionIndex } = getState());
    expect(currentSectionIndex).toBe(3);
    expect(currentSectionTitle).toEqual("Third section");
  });

  test.todo(
    "updates section title and index correctly for a flow with sections in folders",
  );
});

describe("updateSectionData() on backwards navigation", () => {
  test.todo("does not update state if there are no sections in the flow");

  test.todo(
    "updates section title and index correctly for a flow with sections",
  );

  test.todo(
    "updates section title and index correctly for a flow with sections in folders",
  );
});
