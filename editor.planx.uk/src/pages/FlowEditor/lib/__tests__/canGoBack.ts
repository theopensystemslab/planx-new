import { Store, vanillaStore } from "../store";

const { getState, setState } = vanillaStore;

// https://imgur.com/VFV64ax
const flow: Store.flow = {
  _root: {
    edges: ["XYoJeox7F0", "8ZSxuIfFYE", "bmsSl3ScbV", "ltuI9xrBHk"],
  },
  XYoJeox7F0: {
    type: 100,
    data: {
      text: "first question",
    },
    edges: ["VfJAj7agvC", "YQXjsVsGqf"],
  },
  VfJAj7agvC: {
    type: 200,
    data: {
      text: "no fee",
    },
  },
  YQXjsVsGqf: {
    type: 200,
    data: {
      text: "fee",
    },
    edges: ["DlgsufM3OK"],
  },
  DlgsufM3OK: {
    type: 700,
    data: {
      output: "fee",
      formula: "10",
    },
  },
  "8ZSxuIfFYE": {
    type: 400,
    data: {
      title: "Pay for your application",
      fn: "fee",
    },
  },
  ltuI9xrBHk: {
    type: 725,
    data: {
      heading: "Application sent",
    },
  },
  bmsSl3ScbV: {
    type: 250,
    data: {
      content: "<p>after payment</p>\n",
    },
  },
};

beforeEach(() => {
  getState().resetPreview();
  setState({
    flow,
  });
});

describe("can go back if", () => {
  test("the previous component was manually answered", () => {
    setState({
      breadcrumbs: {
        XYoJeox7F0: {
          auto: false,
          answers: ["VfJAj7agvC"],
        },
      },
    });
    expect(getState().canGoBack("8ZSxuIfFYE")).toStrictEqual(true);
  });

  test("the user skipped the payment component", () => {
    setState({
      breadcrumbs: {
        XYoJeox7F0: {
          auto: false,
          answers: ["VfJAj7agvC"],
        },
        "8ZSxuIfFYE": {
          auto: true,
        },
      },
    });
    expect(getState().canGoBack("bmsSl3ScbV")).toStrictEqual(true);
  });
});

describe("cannot go back if", () => {
  test("it's the very first component", () => {
    expect(getState().canGoBack("XYoJeox7F0")).toStrictEqual(false);
  });

  test("the only previous component was auto-answered", () => {
    setState({
      breadcrumbs: {
        XYoJeox7F0: {
          auto: true,
          answers: ["VfJAj7agvC"],
        },
      },
    });
    expect(getState().canGoBack("8ZSxuIfFYE")).toStrictEqual(false);
  });

  test("it's the confirmation component", () => {
    setState({
      breadcrumbs: {
        XYoJeox7F0: {
          auto: false,
          answers: ["VfJAj7agvC"],
        },
        "8ZSxuIfFYE": {
          auto: true,
        },
        bmsSl3ScbV: {
          auto: false,
        },
      },
    });
    expect(getState().canGoBack("ltuI9xrBHk")).toStrictEqual(false);
  });

  test("the applicant made a payment", () => {
    setState({
      breadcrumbs: {
        XYoJeox7F0: {
          auto: false,
          answers: ["YQXjsVsGqf"],
        },
        DlgsufM3OK: {
          auto: true,
          data: {
            fee: 10,
          },
        },
        "8ZSxuIfFYE": {
          auto: false,
        },
      },
    });
    expect(getState().canGoBack("bmsSl3ScbV")).toStrictEqual(false);
  });

  test("changing a component's answer", () => {
    setState({
      breadcrumbs: {
        XYoJeox7F0: {
          auto: false,
          answers: ["YQXjsVsGqf"],
        },
        DlgsufM3OK: {
          auto: true,
          data: {
            fee: 10,
          },
        },
        "8ZSxuIfFYE": {
          auto: false,
        },
      },
      changedNode: "ltuI9xrBHk",
    });
    expect(getState().canGoBack("ltuI9xrBHk")).toStrictEqual(false);
  });
});
