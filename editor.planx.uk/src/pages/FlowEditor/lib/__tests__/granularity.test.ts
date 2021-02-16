import { vanillaStore } from "../store";
import flow from "./flows/granularity";

const { getState, setState } = vanillaStore;

beforeEach(() => {
  getState().resetPreview();
  setState({ flow });

  getState().record("whatisit", ["food"]);
});

it("has collected the correct passport data", () => {
  expect(getState().passport).toEqual({ data: { item: { value: ["food"] } } });
});

it("has the correct next upcoming card", () => {
  expect(getState().upcomingCardIds()).toEqual(["whichfood"]);
});

it("overwrites the existing data with new, more granular data", () => {
  getState().record("whichfood", ["fruit"]);

  expect(getState().passport).toEqual({
    data: { item: { value: ["food.fruit"] } },
  });
});

it("resets the passport data when going back up the flow", () => {
  // visit fruit
  getState().record("whichfood", ["fruit"]);
  // change mind, go back
  getState().record("whichfood");
  expect(getState().upcomingCardIds()).toEqual(["whichfood"]);
  expect(getState().passport).toEqual({
    data: { item: { value: ["food"] } },
  });
});
