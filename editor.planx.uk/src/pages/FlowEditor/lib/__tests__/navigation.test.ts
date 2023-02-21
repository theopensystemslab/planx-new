import { vanillaStore } from "../store";

const { getState, setState } = vanillaStore;

beforeEach(() => {
  getState().resetPreview();
  setState({ navTest: "default value" });
});

test.skip("Can get value from NavigationStore", () => {
  const { navTest } = getState();
  expect(navTest).toEqual("default value");
});

test.skip("Can set value in NavigationStore", () => {
  setState({ navTest: "new value" });
  const { navTest } = getState();
  expect(navTest).toEqual("new value");
});
