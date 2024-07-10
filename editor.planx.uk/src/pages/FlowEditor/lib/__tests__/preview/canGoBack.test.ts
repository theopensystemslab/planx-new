import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";

import { Store, vanillaStore } from "../../store";

const { getState, setState } = vanillaStore;
const { canGoBack, getCurrentCard, resetPreview } = getState();

// https://imgur.com/VFV64ax
const flow: Store.flow = {
  _root: {
    edges: ["Question", "Pay", "Content", "Confirmation"],
  },
  Question: {
    type: TYPES.Question,
    data: {
      text: "first question",
    },
    edges: ["NoFeeAnswerPath", "FeeAnswerPath"],
  },
  NoFeeAnswerPath: {
    type: TYPES.Answer,
    data: {
      text: "no fee",
    },
  },
  FeeAnswerPath: {
    type: TYPES.Answer,
    data: {
      text: "fee",
    },
    edges: ["Calculate"],
  },
  Calculate: {
    type: TYPES.Calculate,
    data: {
      output: "fee",
      formula: "10",
    },
  },
  Pay: {
    type: TYPES.Pay,
    data: {
      title: "Pay for your application",
      fn: "fee",
    },
  },
  Confirmation: {
    type: TYPES.Confirmation,
    data: {
      heading: "Application sent",
    },
  },
  Content: {
    type: TYPES.Content,
    data: {
      content: "<p>after payment</p>\n",
    },
  },
};

beforeEach(() => {
  resetPreview();
  setState({
    flow,
  });
});

describe("can go back if", () => {
  test("the previous component was manually answered", () => {
    setState({
      breadcrumbs: {
        Question: {
          auto: false,
          answers: ["NoFeeAnswerPath"],
        },
      },
    });
    expect(canGoBack(getCurrentCard())).toStrictEqual(true);
  });

  test("the user skipped the payment component", () => {
    setState({
      breadcrumbs: {
        Question: {
          auto: false,
          answers: ["NoFeeAnswerPath"],
        },
        Pay: {
          auto: true,
        },
      },
    });
    expect(canGoBack(getCurrentCard())).toStrictEqual(true);
  });
});

describe("cannot go back if", () => {
  test("it's the very first component", () => {
    expect(canGoBack(getCurrentCard())).toStrictEqual(false);
  });

  test("the only previous component was auto-answered", () => {
    setState({
      breadcrumbs: {
        Question: {
          auto: true,
          answers: ["NoFeeAnswerPath"],
        },
      },
    });
    expect(canGoBack(getCurrentCard())).toStrictEqual(false);
  });

  test("the applicant made a payment", () => {
    setState({
      breadcrumbs: {
        Question: {
          auto: false,
          answers: ["FeeAnswerPath"],
        },
        Calculate: {
          auto: true,
          data: {
            fee: 10,
          },
        },
        Pay: {
          auto: false,
        },
      },
    });
    expect(canGoBack(getCurrentCard())).toStrictEqual(false);
  });

  test("changing a component's answer", () => {
    setState({
      breadcrumbs: {
        Question: {
          auto: false,
          answers: ["FeeAnswerPath"],
        },
        Calculate: {
          auto: true,
          data: {
            fee: 10,
          },
        },
        Pay: {
          auto: false,
        },
      },
      changedNode: "Confirmation",
    });
    expect(canGoBack(getCurrentCard())).toStrictEqual(false);
  });
});
