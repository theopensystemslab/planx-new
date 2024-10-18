import { Store, useStore } from "../store";
import flowWithAutoAnsweredFilterPaths from "./mocks/flowWithAutoAnsweredFilterPaths.json";

const { getState, setState } = useStore;
const {
  upcomingCardIds,
  resetPreview,
  record,
  getCurrentCard,
} = getState();

describe("A filter on the root of the graph", () => {
  beforeEach(() => {
    resetPreview();
    setState({ flow: flowWithFilters });
  });

  test.todo("Filter options are auto-answered correctly when a higher order flag is picked up first");
  
  test.todo("Filter options are auto-answered correctly when a lower order flag is picked up first");
  
  test.todo("Filter 'No flag result' option is auto-answered correctly when no flags in this category have been picked up");
});

describe("A filter on a branch", () => {
  beforeEach(() => {
    resetPreview();
    setState({ flow: flowWithFilters });
  });

  test.todo("Filter options are auto-answered correctly when a higher order flag is picked up first");
  
  test.todo("Filter options are auto-answered correctly when a lower order flag is picked up first");
  
  test.todo("Filter 'No flag result' option is auto-answered correctly when no flags in this category have been picked up");
});

describe("Nodes on a filter path should only be auto-answered when the path matches the result", () => {
  beforeEach(() => {
    resetPreview();
    setState({ flow: flowWithAutoAnsweredFilterPaths }); // https://editor.planx.uk/testing/flag-order-test-with-autoanswer
  });

  test.skip("Filter path nodes are auto-answered correctly when the highest order flag is picked up first", () => {
    const visitedNodes = () => Object.keys(getState().breadcrumbs);

    // go forward manually: select not listed and select an answer with permission needed (higher order) flag
    record("zlKQyPuKsl", { answers: ["qW1jzS1qPy"], auto: false });
    record("Ve90wVIXsV", { answers: ["d98AoVIXsV"], auto: false }); // as we pick up this flag, later nodes in matching filter path are auto-answered immediately

    // continue forward manually: select an answer with permitted development (lower order) flag
    record("TiIuAVIXsV", { answers: ["hdaeOVIXsV"], auto: false });

    // land on the correct result component
    expect(getCurrentCard()?.id).toBe("seN42VIXsV");
    expect(getState().resultData()["Planning permission"]).toHaveProperty(
      "flag.value",
      "PLANNING_PERMISSION_REQUIRED",
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
    const visitedNodes = () => Object.keys(getState().breadcrumbs);

    // go forward manually: select not listed and select an answer with permitted dev (lower order) flag
    record("zlKQyPuKsl", { answers: ["qW1jzS1qPy"], auto: false });
    record("Ve90wVIXsV", { answers: ["pghecgQLgs"], auto: false });
    upcomingCardIds(); // mimic "continue" and properly set visitedNodes()

    // TODO ensure that the auto-answerable question in the permitted dev filter path has not been immediately auto-answered before reaching the filter node
    expect(visitedNodes()).not.toContain("AaEuHnVUb4");

    // continue forward manually: select an answer with permission needed (higher order) flag
    record("TiIuAVIXsV", { answers: ["OPOWoVIXsV"], auto: false });
    upcomingCardIds();

    // land on the correct result component
    expect(getCurrentCard()?.id).toBe("seN42VIXsV");
    expect(getState().resultData()["Planning permission"]).toHaveProperty(
      "flag.value",
      "PLANNING_PERMISSION_REQUIRED",
    );

    // expect the auto-answered question on the permission needed filter path to be in our breadcrumbs
    expect(visitedNodes()).toContain("1ShlhWrXPl");
    expect(getState().breadcrumbs["1ShlhWrXPl"]).toEqual({
      answers: ["tesCNavKYo"],
      auto: true,
    });
  });
});

const flowWithFilters: Store.Flow = {
  // TODO 
};
