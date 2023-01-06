import { visitInParallel } from "graphql";

import { vanillaStore } from "../store";
import flowWithAutoAnsweredFilterPaths from "./mocks/flowWithAutoAnsweredFilterPaths.json";
import flowWithBranchingFilters from "./mocks/flowWithBranchingFilters.json";
import flowWithRootFilter from "./mocks/flowWithRootFilter.json";

const { getState, setState } = vanillaStore;
const {
  upcomingCardIds,
  resetPreview,
  record,
  currentCard,
  collectedFlags,
  resultData,
} = getState();

// https://i.imgur.com/k0kkKox.png
describe("A filter on the root of the graph", () => {
  beforeEach(() => {
    resetPreview();
  });

  test.skip("don't expand filters before visiting them (A)", () => {
    setState({
      flow: flowWithRootFilter,
    });

    expect(upcomingCardIds()).toEqual([
      "d5SxIWZej9",
      "LAz2YqYChs",
      "nroxFPM2Jx",
    ]);
  });

  test("immune path (B)", () => {
    setState({
      flow: flowWithRootFilter,
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
      flow: flowWithRootFilter,
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

describe("A filter on a branch", () => {
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

describe("Nodes on a filter path should only be auto-answered when the path matches the result", () => {
  beforeEach(() => {
    resetPreview();
    setState({ flow: flowWithAutoAnsweredFilterPaths }); // https://editor.planx.uk/testing/flag-order-test-with-autoanswer
  });

  test("Filter path nodes are auto-answered correctly when the highest order flag is picked up first", () => {
    let visitedNodes = () => Object.keys(getState().breadcrumbs);

    // go forward manually: select not listed and select an answer with permission needed (higher order) flag
    record("zlKQyPuKsl", { answers: ["qW1jzS1qPy"], auto: false });
    record("Ve90wVIXsV", { answers: ["d98AoVIXsV"], auto: false }); // as we pick up this flag, later nodes in matching filter path are auto-answered immediately

    // continue forward manually: select an answer with permitted development (lower order) flag
    record("TiIuAVIXsV", { answers: ["hdaeOVIXsV"], auto: false });

    // land on the correct result component
    expect(currentCard()?.id).toBe("seN42VIXsV");
    expect(getState().resultData()["Planning permission"]).toHaveProperty(
      "flag.value",
      "PLANNING_PERMISSION_REQUIRED"
    );

    // expect the auto-answered question on the permission needed filter path to be in our breadcrumbs
    expect(visitedNodes()).toContain("1ShlhWrXPl");
    expect(getState().breadcrumbs["1ShlhWrXPl"]).toEqual({
      answers: ["tesCNavKYo"],
      auto: true,
    });

    // make sure the auto-answerable question and its child from the permitted development filter path is not in our breadcrumbs nor upcoming card ids
    expect(visitedNodes()).not.toContain("AaEuHnVUb4");
    expect(upcomingCardIds).not.toContain("xjcujhpzjs");
  });

  test.skip("Filter path nodes are auto-answered correctly when a lower order flag is picked up first", () => {
    let visitedNodes = () => Object.keys(getState().breadcrumbs);

    // go forward manually: select not listed and select an answer with permitted dev (lower order) flag
    record("zlKQyPuKsl", { answers: ["qW1jzS1qPy"], auto: false });
    record("Ve90wVIXsV", { answers: ["pghecgQLgs"], auto: false });

    // continue forward manually: select an answer with permission needed (higher order) flag
    record("TiIuAVIXsV", { answers: ["OPOWoVIXsV"], auto: false });

    // land on the correct result component
    expect(currentCard()?.id).toBe("seN42VIXsV");
    expect(getState().resultData()["Planning permission"]).toHaveProperty(
      "flag.value",
      "PLANNING_PERMISSION_REQUIRED"
    );

    // expect the auto-answered question on the permission needed filter path to be in our breadcrumbs
    expect(visitedNodes()).toContain("1ShlhWrXPl");
    expect(getState().breadcrumbs["1ShlhWrXPl"]).toEqual({
      answers: ["tesCNavKYo"],
      auto: true,
    });

    // TEST-GENERATED BREADCRUMBS DO NOT MATCH PRODUCTION BREADCRUMBS, THIS SHOULD BE FAILING
    // make sure the auto-answerable question and its child from the permitted development filter path is not in our breadcrumbs nor upcoming card ids
    expect(visitedNodes()).not.toContain("AaEuHnVUb4");
    expect(upcomingCardIds).not.toContain("xjcujhpzjs");
  });
});
