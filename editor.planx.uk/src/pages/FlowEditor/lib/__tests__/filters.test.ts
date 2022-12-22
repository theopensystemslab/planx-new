import { vanillaStore } from "../store";
import flowWithBranchingFilters from "./mocks/flowWithBranchingFilters.json";
import flowWithSingleFilter from "./mocks/flowWithSingleFilter.json";

const { getState, setState } = vanillaStore;
const { upcomingCardIds, resetPreview, record, currentCard, collectedFlags } =
  getState();

// https://i.imgur.com/k0kkKox.png
describe("Single filter", () => {
  beforeEach(() => {
    resetPreview();
  });

  test.skip("don't expand filters before visiting them (A)", () => {
    setState({
      flow: flowWithSingleFilter,
    });

    expect(upcomingCardIds()).toEqual([
      "d5SxIWZej9",
      "LAz2YqYChs",
      "nroxFPM2Jx",
    ]);
  });

  test("immune path (B)", () => {
    setState({
      flow: flowWithSingleFilter,
      breadcrumbs: {
        d5SxIWZej9: {
          auto: false,
          answers: ["FZ1kmhT37j"],
        },
      },
    });

    expect(upcomingCardIds()).toEqual(["TmpbJgjGPH", "nroxFPM2Jx"]);
  });

  test("not immune path (C)", () => {
    setState({
      flow: flowWithSingleFilter,
      breadcrumbs: {
        d5SxIWZej9: {
          auto: false,
          answers: ["ZTZqcDAOoG"],
        },
      },
    });

    expect(upcomingCardIds()).toEqual(["lOrm4XmVGv", "nroxFPM2Jx"]);
  });
});

describe("Branching filters", () => {
  beforeEach(() => {
    resetPreview();
    setState({ flow: flowWithBranchingFilters });
  });

  test.skip("Picking up flag routes me correctly through the second filter", () => {
    let visitedNodes = () => Object.keys(getState().breadcrumbs);

    // Traverse forward to pick up an "IMMUNE" flag
    record("pickFlag", { answers: ["setImmunity"] });
    record("immunityPath1", { answers: [] });
    expect(collectedFlags("immunityPath1", visitedNodes())).toStrictEqual([
      "IMMUNE",
    ]);

    // Traverse forward through next filter
    record("fork", { answers: ["filter2"] });

    // XXX: Test fails here
    // The currentCard returns as "immunityFlag2" which we should not land on -
    // the flags on the first filter are skipped, we go direct from "immunityPath1" to "fork"
    expect(currentCard()?.id).toBe("immunityPath2");
  });
});
