import { Store, vanillaStore } from "../store";

// flow preview: https://i.imgur.com/nCov5CE.png

const flow: Store.flow = {
  _root: {
    edges: ["NS7QFc7Cjc", "3cNtq1pLmt", "eTBHJsbJKc"],
  },
  "3cNtq1pLmt": {
    data: {
      fn: "animal",
      text: "is it a lion?",
    },
    type: 100,
    edges: ["TDIbLrdTdd", "TnvmCtle0s"],
  },
  BecasKrIhI: {
    data: {
      text: "neither",
    },
    type: 200,
  },
  NS7QFc7Cjc: {
    data: {
      fn: "animal",
      text: "which wild cat is it?",
    },
    type: 100,
    edges: ["sv0hklWPX1", "UqZo0rGwcY", "BecasKrIhI"],
  },
  Nrf7BHDJvO: {
    data: {
      text: "neither",
    },
    type: 200,
    edges: ["UOefNWg6uf"],
  },
  Sd38UCC8Cg: {
    data: {
      content: "<p>it's a lion</p>\n",
    },
    type: 250,
  },
  TDIbLrdTdd: {
    data: {
      val: "lion",
      text: "yes",
    },
    type: 200,
  },
  TnvmCtle0s: {
    data: {
      text: "no",
    },
    type: 200,
  },
  UOefNWg6uf: {
    data: {
      content: "<p>it's a tiger or something else</p>\n",
    },
    type: 250,
  },
  UqZo0rGwcY: {
    data: {
      val: "tiger",
      text: "tiger",
    },
    type: 200,
  },
  eOoDvdKjWf: {
    data: {
      val: "lion",
      text: "lion",
    },
    type: 200,
    edges: ["Sd38UCC8Cg"],
  },
  eTBHJsbJKc: {
    data: {
      fn: "animal",
      text: "ok, so which animal is it?",
    },
    type: 100,
    edges: ["eOoDvdKjWf", "nR15Tl0lhC", "Nrf7BHDJvO"],
  },
  nR15Tl0lhC: {
    data: {
      val: "gazelle",
      text: "gazelle",
    },
    type: 200,
    edges: ["pqZK1mpn23"],
  },
  pqZK1mpn23: {
    data: {
      content: "<p>it's a gazelle</p>\n",
    },
    type: 250,
  },
  sv0hklWPX1: {
    data: {
      val: "lion",
      text: "lion",
    },
    type: 200,
  },
};

const { getState, setState } = vanillaStore;

describe("if I initially pick", () => {
  beforeEach(() => {
    getState().resetPreview();
    setState({ flow });
  });

  test("lion, it should display 'lion'", () => {
    getState().record("NS7QFc7Cjc", { answers: ["TDIbLrdTdd"] });
    expect(getState().upcomingCardIds()).toEqual(["Sd38UCC8Cg"]);
  });

  test("tiger, it should display 'tiger or something else'", () => {
    getState().record("NS7QFc7Cjc", { answers: ["UqZo0rGwcY"] });
    expect(getState().upcomingCardIds()).toEqual(["UOefNWg6uf"]);
  });

  test("gazelle, it should ask which animal it is", () => {
    getState().record("NS7QFc7Cjc", { answers: ["BecasKrIhI"] });
    expect(getState().upcomingCardIds()).toEqual(["eTBHJsbJKc"]);
    getState().record("eTBHJsbJKc", { answers: ["nR15Tl0lhC"] });
    expect(getState().upcomingCardIds()).toEqual(["pqZK1mpn23"]);
  });
});

test("back button works as expected", () => {
  getState().resetPreview();
  setState({
    flow,
    breadcrumbs: {
      NS7QFc7Cjc: {
        answers: ["BecasKrIhI"],
        auto: false,
      },
      "3cNtq1pLmt": {
        answers: ["TnvmCtle0s"],
        auto: true,
      },
      eTBHJsbJKc: {
        answers: ["nR15Tl0lhC"],
        auto: false,
      },
    },
  });

  getState().record("eTBHJsbJKc");
  expect(getState().upcomingCardIds()).toEqual(["eTBHJsbJKc"]);
});
