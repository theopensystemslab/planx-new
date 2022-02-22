import { vanillaStore } from "../store";

const { getState, setState } = vanillaStore;

beforeEach(() => {
  getState().resetPreview();
});

const setup = (args = {}) =>
  setState({
    flow: {
      _root: {
        edges: ["a", "b", "c"],
      },
      a: {},
      b: {},
      c: {},
    },
    ...args,
  });

describe("store.previousCard is", () => {
  test("undefined when there are no breadcrumbs", () => {
    setup();
    expect(getState().previousCard(getState().currentCard())).toBeUndefined();
  });

  test("undefined when cards were automatically answered", () => {
    setup({
      breadcrumbs: {
        a: { auto: true },
        b: { auto: true },
      },
    });
    expect(getState().previousCard(getState().currentCard())).toBeUndefined();
  });

  test("the most recent human-answered card id", () => {
    setup({
      breadcrumbs: {
        a: { auto: false }, // a human answered this card
        b: { auto: true },
      },
    });

    expect(getState().previousCard(getState().currentCard())).toEqual("a");
  });
});
