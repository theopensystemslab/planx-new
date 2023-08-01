import { TYPES } from "@planx/components/types";

import { FullStore, vanillaStore } from "../store";
import flowWithoutSections from "./mocks/flowWithClones.json";
import flowWithThreeSections from "./mocks/flowWithThreeSections.json";

const { getState, setState } = vanillaStore;
const { filterFlowByType, initNavigationStore, record } = getState();

let initialState: FullStore;

beforeEach(() => {
  initialState = getState();
});

afterEach(() => setState(initialState));

test("filterFlowByType() correctly returns a filtered view of the given flow", () => {
  setState({ flow: flowWithThreeSections });

  // Three Sections in test flow
  const sectionResult = filterFlowByType(TYPES.Section);
  expect(Object.keys(sectionResult)).toEqual(
    expect.arrayContaining(["firstSection", "secondSection", "thirdSection"]),
  );

  // Three Statements in test flow
  const statementResult = filterFlowByType(TYPES.Statement);
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

test("initNavigationStore() sets expected initial values for flow without sections", () => {
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

test("initNavigationStore() sets expected initial values for flow with sections", () => {
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

test("updateSectionData() does not update state if there are no sections in the flow", () => {
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

test("updateSectionData() updates section title and index correctly", () => {
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
