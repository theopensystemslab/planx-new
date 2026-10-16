import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";

import type { FullStore } from "../store";
import { useStore } from "../store";
import {
  selectCurrentSectionIndex,
  selectCurrentSectionTitle,
  selectSectionCount,
  selectSectionNodes,
  selectSectionProgress,
} from "../store/selectors";
import flowWithoutSections from "./mocks/flowWithClones.json";
import flowWithSectionsInFolders from "./mocks/flowWithSectionsInFolders.json";
import flowWithThreeSections from "./mocks/flowWithThreeSections.json";

const { getState, setState } = useStore;
const {
  filterFlowByType,
  record,
  resetPreview,
  setCurrentCard,
  upcomingCardIds,
} = getState();

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

const getSectionState = () => ({
  sectionNodes: selectSectionNodes(getState()),
  sectionCount: selectSectionCount(getState()),
  currentSectionIndex: selectCurrentSectionIndex(getState()),
  currentSectionTitle: selectCurrentSectionTitle(getState()),
});

describe("section state on initial load", () => {
  test("sets expected initial values for flow without sections", () => {
    setState({ flow: flowWithoutSections });

    const { sectionCount, currentSectionTitle, sectionNodes } =
      getSectionState();
    expect(sectionCount).toBe(0);
    expect(currentSectionTitle).toBeUndefined();
    expect(Object.keys(sectionNodes).length).toBe(0);
  });

  test("sets expected initial values for flow with sections", () => {
    setState({ flow: flowWithThreeSections });

    const { sectionCount, currentSectionTitle, sectionNodes } =
      getSectionState();
    expect(sectionCount).toBe(3);
    expect(currentSectionTitle).toBe("First section");
    expect(Object.keys(sectionNodes)).toEqual(
      expect.arrayContaining(["firstSection", "secondSection", "thirdSection"]),
    );
  });

  test("sets expected initial values for flow with sections in folders", () => {
    setState({ flow: flowWithSectionsInFolders });

    const { sectionCount, currentSectionTitle, sectionNodes } =
      getSectionState();
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

describe("section state on forwards navigation", () => {
  test("does not change if there are no sections in the flow", () => {
    setState({ flow: flowWithoutSections });

    let { currentSectionTitle, currentSectionIndex } = getSectionState();
    expect(currentSectionIndex).toBe(1);
    expect(currentSectionTitle).toBeUndefined();

    record("question", { answers: ["leftChoice"] });
    record("leftChoice", { answers: ["leftNotice"] });

    ({ currentSectionTitle, currentSectionIndex } = getSectionState());
    expect(currentSectionIndex).toBe(1);
    expect(currentSectionTitle).toBeUndefined();
  });

  test("updates section title and index correctly for a flow with sections", () => {
    setState({ flow: flowWithThreeSections });

    // First section correctly set on initial load
    let { currentSectionTitle, currentSectionIndex } = getSectionState();
    expect(currentSectionIndex).toBe(1);
    expect(currentSectionTitle).toEqual("First section");

    // Navigate into first section
    record("firstSection", { auto: true });

    // First section is still correctly set
    ({ currentSectionTitle, currentSectionIndex } = getSectionState());
    expect(currentSectionIndex).toBe(1);
    expect(currentSectionTitle).toEqual("First section");

    // Navigate into second section
    record("firstQuestion", { answers: ["firstAnswer"] });
    record("secondSection", { auto: true });

    // Second section is correctly set
    ({ currentSectionTitle, currentSectionIndex } = getSectionState());
    expect(currentSectionIndex).toBe(2);
    expect(currentSectionTitle).toEqual("Second section");

    // Navigate into third section
    record("secondQuestion", { answers: ["secondAnswer"] });
    record("thirdSection", { auto: true });

    // Third section is correctly set
    ({ currentSectionTitle, currentSectionIndex } = getSectionState());
    expect(currentSectionIndex).toBe(3);
    expect(currentSectionTitle).toEqual("Third section");
  });

  test("updates section title and index correctly for a flow with sections in folders", () => {
    setState({ flow: flowWithSectionsInFolders });

    // Navigate into first section
    record("FirstSection", { auto: false });

    // First section is set correctly
    let { currentSectionTitle, currentSectionIndex } = getSectionState();
    expect(currentSectionIndex).toBe(1);
    expect(currentSectionTitle).toEqual("First");

    // Navigate into section section which is within a folder
    record("Question", { answers: ["LeftOption"] });
    expect(upcomingCardIds()?.[0]).toEqual("MiddleSectionInFolder"); // folder node itself is omitted from upcomingCardIds()
    record("MiddleSectionInFolder", { auto: false });

    // Second section in folder is set correctly
    ({ currentSectionTitle, currentSectionIndex } = getSectionState());
    expect(currentSectionIndex).toBe(2);
    expect(currentSectionTitle).toEqual("Middle");

    // Navigate through folder back to root & final section
    expect(upcomingCardIds()?.[0]).toEqual("FolderContent");
    record("FolderContent", { auto: false });
    expect(upcomingCardIds()?.[0]).toEqual("FinalSection");
    record("FinalSection", { auto: false });

    // Final section is set correctly
    ({ currentSectionTitle, currentSectionIndex } = getSectionState());
    expect(currentSectionIndex).toBe(3);
    expect(currentSectionTitle).toEqual("Final");
  });

  test("enters a section as soon as its card is reached", () => {
    setState({ flow: flowWithThreeSections });

    record("firstSection", { auto: true });
    record("firstQuestion", { answers: ["firstAnswer"] });

    // Second section card is current, but not yet in breadcrumbs
    expect(getState().currentCard?.id).toBe("secondSection");
    expect(getState().breadcrumbs).not.toHaveProperty("secondSection");

    const { currentSectionTitle, currentSectionIndex } = getSectionState();
    expect(currentSectionIndex).toBe(2);
    expect(currentSectionTitle).toEqual("Second section");
  });
});

describe("section state on backwards navigation", () => {
  test("updates section title and index correctly for a flow with sections", () => {
    setState({ flow: flowWithThreeSections });

    record("firstSection", { auto: true });
    record("firstQuestion", { answers: ["firstAnswer"] });
    record("secondSection", { auto: true });
    expect(getSectionState().currentSectionIndex).toBe(2);

    // Go back to the first question
    record("firstQuestion");

    const { currentSectionTitle, currentSectionIndex } = getSectionState();
    expect(currentSectionIndex).toBe(1);
    expect(currentSectionTitle).toEqual("First section");
  });
});

describe("section state on resetPreview()", () => {
  test("returns to the first section", () => {
    setState({ flow: flowWithThreeSections, previewEnvironment: "editor" });

    record("firstSection", { auto: true });
    record("firstQuestion", { answers: ["firstAnswer"] });
    record("secondSection", { auto: true });
    expect(getSectionState().currentSectionIndex).toBe(2);

    resetPreview();
    setCurrentCard();

    const { currentSectionTitle, currentSectionIndex } = getSectionState();
    expect(getState().currentCard?.id).toBe("firstSection");
    expect(currentSectionIndex).toBe(1);
    expect(currentSectionTitle).toEqual("First section");
    expect(selectSectionProgress(getState())?.completed).toBe(0);
  });
});

describe("section state on flow changes", () => {
  test("updates when the flow is replaced", () => {
    setState({ flow: flowWithoutSections });
    expect(getSectionState().sectionCount).toBe(0);

    // e.g. a ShareDB sync, or loading a published flow
    setState({ flow: flowWithThreeSections });
    expect(getSectionState().sectionCount).toBe(3);
    expect(getSectionState().currentSectionTitle).toEqual("First section");
  });
});
