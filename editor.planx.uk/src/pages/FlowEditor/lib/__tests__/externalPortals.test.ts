import { FullStore, vanillaStore } from "../store";
import multipleExternalPortals from "./mocks/multipleExternalPortals.json";
import singleExternalPortal from "./mocks/singleExternalPortal.json";

const { getState, setState } = vanillaStore;
const { upcomingCardIds, record } = getState();

let initialState: FullStore;

beforeEach(() => {
  initialState = getState();
});

describe("A flow with a single external portal can be navigated as expected", () => {
  beforeEach(() => setState({ flow: singleExternalPortal }));
  afterEach(() => setState(initialState));

  it("without entering the portal", () => {
    expect(upcomingCardIds()[0]).toEqual("firstNode");
    // Navigate down branch avoiding external portal
    record("firstNode", { answers: ["option2"] });
    expect(upcomingCardIds()[0]).toEqual("finalNode");
  });

  it("via the portal", () => {
    expect(upcomingCardIds()[0]).toEqual("firstNode");
    // Navigate down branch via external portal
    record("firstNode", { answers: ["option1"] });
    expect(upcomingCardIds()[0]).toEqual("withinExternalPortal");
    record("withinExternalPortal", { answers: [] });
    expect(upcomingCardIds()[0]).toEqual("finalNode");
  });
});

describe("A flow with repeated external portals can be navigated as expected", () => {
  beforeEach(() => setState({ flow: multipleExternalPortals }));
  afterEach(() => setState(initialState));

  it("without entering the portal", () => {
    expect(upcomingCardIds()[0]).toEqual("firstNode");
    // Navigate down branch avoiding external portal
    record("firstNode", { answers: ["option3"] });
    expect(upcomingCardIds()[0]).toEqual("finalNode");
  });

  it("via the first portal", () => {
    expect(upcomingCardIds()[0]).toEqual("firstNode");
    // Navigate down branch via first external portal
    record("firstNode", { answers: ["option1"] });
    expect(upcomingCardIds()[0]).toEqual("withinExternalPortal");
    record("withinExternalPortal", { answers: [] });
    expect(upcomingCardIds()[0]).toEqual("finalNode");
  });

  it("via the second portal", () => {
    expect(upcomingCardIds()[0]).toEqual("firstNode");
    // Navigate down branch via second external portal
    record("firstNode", { answers: ["option2"] });
    expect(upcomingCardIds()[0]).toEqual("withinExternalPortal");
    record("withinExternalPortal", { answers: [] });
    expect(upcomingCardIds()[0]).toEqual("finalNode");
  });
});