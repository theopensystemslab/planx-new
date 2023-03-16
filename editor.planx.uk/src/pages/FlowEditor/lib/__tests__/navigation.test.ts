import { TYPES } from "@planx/components/types";
import { hasFeatureFlag, toggleFeatureFlag } from "lib/featureFlags";

import { FullStore, vanillaStore } from "../store";
import flowWithoutSections from "./mocks/flowWithClones.json";
import flowWithThreeSections from "./mocks/flowWithThreeSections.json";

const { getState, setState } = vanillaStore;
const { filterFlowByType, initNavigationStore, record, sectionStatuses } =
  getState();

let initialState: FullStore;

beforeEach(() => {
  initialState = getState();
  if (hasFeatureFlag("NAVIGATION_UI")) {
    toggleFeatureFlag("NAVIGATION_UI");
  }
});

afterEach(() => setState(initialState));

test("filterFlowByType() correctly returns a filtered view of the given flow", () => {
  setState({ flow: flowWithThreeSections });

  // Three Sections in test flow
  const sectionResult = filterFlowByType(TYPES.Section);
  expect(Object.keys(sectionResult)).toEqual(
    expect.arrayContaining(["firstSection", "secondSection", "thirdSection"])
  );

  // Three Statements in test flow
  const statementResult = filterFlowByType(TYPES.Statement);
  expect(Object.keys(statementResult)).toEqual(
    expect.arrayContaining(["firstQuestion", "secondQuestion", "thirdQuestion"])
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
    expect.arrayContaining(["firstSection", "secondSection", "thirdSection"])
  );
});

test("initNavigationStore() sets 'hasSections' to false when feature flag not enabled", () => {
  setState({ flow: flowWithThreeSections });
  initNavigationStore();
  const { hasSections } = getState();

  expect(hasFeatureFlag("NAVIGATION_UI")).toBe(false);
  expect(hasSections).toBe(false);
});

test("initNavigationStore() sets 'hasSections' to true when feature flag enabled", () => {
  toggleFeatureFlag("NAVIGATION_UI");
  setState({ flow: flowWithThreeSections });
  initNavigationStore();
  const { hasSections } = getState();

  expect(hasFeatureFlag("NAVIGATION_UI")).toBe(true);
  expect(hasSections).toBe(true);
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
  toggleFeatureFlag("NAVIGATION_UI");
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

test("SectionStatuses() gets the initial statuses of all sections in a flow", () => {
  setState({ flow: flowWithThreeSections });
  initNavigationStore();

  // Get initial statuses
  const statuses = sectionStatuses();

  // There's a status entry per section node in the test flow
  expect(Object.keys(statuses)).toHaveLength(3);

  // Initial statuses are calculated correctly
  expect(statuses).toEqual({
    firstSection: "READY TO CONTINUE",
    secondSection: "CANNOT CONTINUE YET",
    thirdSection: "CANNOT CONTINUE YET",
  });
});

test("sectionStatuses() updates the status of sections in a flow as you navigate forwards", () => {
  setState({ flow: flowWithThreeSections });
  initNavigationStore();

  // Navigate forwards
  record("firstSection", { auto: false });
  record("firstQuestion", { answers: ["firstAnswer"] });

  // Get statuses
  const statuses = sectionStatuses();

  // Confirm statuses have been updated correctly
  expect(statuses).toEqual({
    firstSection: "COMPLETED",
    secondSection: "READY TO CONTINUE",
    thirdSection: "CANNOT CONTINUE YET",
  });

  // Navigate forwards again
  record("secondSection", { auto: false });
  record("secondQuestion", { answers: ["secondAnswer"] });

  const newStatuses = sectionStatuses();

  // Confirm statuses have been updated correctly
  expect(newStatuses).toEqual({
    firstSection: "COMPLETED",
    secondSection: "COMPLETED",
    thirdSection: "READY TO CONTINUE",
  });
});

test("sectionStatuses() applies the NEW INFORMATION NEEDED status if a section was updated during reconciliation", () => {
  setState({ flow: flowWithThreeSections });
  initNavigationStore();

  // Navigate forwards
  record("firstSection", { auto: false });
  record("firstQuestion", { answers: ["firstAnswer"] });

  // Get statuses - passing the optional arguments to mimic the first section being flagged as changed during reconciliation (eg was renamed or similar)
  //   first argument = undefined means we'll fallback to using state.cachedBreadcrumbs to calculate all other statuses
  const statuses = sectionStatuses(undefined, ["firstSection"]);

  expect(statuses).toEqual({
    firstSection: "NEW INFORMATION NEEDED", // no longer considered COMPLETED
    secondSection: "READY TO CONTINUE",
    thirdSection: "CANNOT CONTINUE YET",
  });
});
