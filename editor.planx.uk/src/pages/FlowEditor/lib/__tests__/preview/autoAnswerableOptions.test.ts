import { useStore } from "../../store";

const { getState } = useStore;
const { resetPreview } = getState();

beforeEach(() => {
  resetPreview();
});

describe("Questions", () => {
  test.todo("Correctly auto-answers the option that exactly matches a passport value");

  test.todo("Correctly auto-answers the less granular option when there's a single more granular passport value");

  test.todo("Correctly auto-answers the single left-most option when there are many matching passport values");

  test.todo("Correctly auto-answers through the blank path when there are no matching passport values but we've seen this passport fn before");
});

describe("Checklists", () => {
  test.todo("Correctly auto-answers all options that exactly match passport values");

  test.todo("Correctly auto-answers all less granular options when there are more granular passport values");

  test.todo("Correctly auto-answers through the blank path when there are no matching passport values but we've seen this passport fn before");
});

describe("Filters", () => {
  test.todo("Correctly auto-answers the single highest order flag path when many flags are collected");

  test.todo("Correctly auto-answers the through the blank path (no flag result) when no matching flags have been collected");
});
