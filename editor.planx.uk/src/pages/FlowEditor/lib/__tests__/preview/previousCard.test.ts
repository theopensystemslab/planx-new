import { vanillaStore } from "../../store";

const { getState, setState } = vanillaStore;

const { resetPreview, previousCard, getCurrentCard } = getState();

beforeEach(() => {
  resetPreview();
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
    expect(previousCard(getCurrentCard())).toBeUndefined();
  });

  test("undefined when cards were automatically answered", () => {
    setup({
      breadcrumbs: {
        a: { auto: true },
        b: { auto: true },
      },
    });
    expect(previousCard(getCurrentCard())).toBeUndefined();
  });

  test("the most recent human-answered card id", () => {
    setup({
      breadcrumbs: {
        a: { auto: false }, // a human answered this card
        b: { auto: true },
      },
    });

    expect(previousCard(getCurrentCard())).toEqual("a");
  });
});
