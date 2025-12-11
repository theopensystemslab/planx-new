import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";

import { Store, useStore } from "../../store";

const { getState, setState } = useStore;
const { canGoBack, getCurrentCard, resetPreview, record, changeAnswer } =
  getState();

// https://imgur.com/VFV64ax
const flow: Store.Flow = {
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
      fn: "fee",
      formula: "10",
    },
  },
  Pay: {
    type: TYPES.Pay,
    data: {
      title: "Pay",
      fn: "fee",
    },
  },
  Confirmation: {
    type: TYPES.Confirmation,
    data: {
      heading: "Form sent",
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
    record("Question", {
      auto: false,
      answers: ["NoFeeAnswerPath"],
    });

    expect(canGoBack(getCurrentCard())).toStrictEqual(true);
  });

  test("the user skipped the payment component", () => {
    record("Question", {
      auto: false,
      answers: ["NoFeeAnswerPath"],
    });
    record("Pay", { auto: true });

    expect(canGoBack(getCurrentCard())).toStrictEqual(true);
  });
});

describe("cannot go back if", () => {
  test("it's the very first component", () => {
    expect(canGoBack(getCurrentCard())).toStrictEqual(false);
  });

  test("the only previous component was auto-answered", () => {
    record("Question", {
      auto: true,
      answers: ["NoFeeAnswerPath"],
    });

    expect(canGoBack(getCurrentCard())).toStrictEqual(false);
  });

  test("the applicant made a payment", () => {
    record("Question", {
      auto: false,
      answers: ["NoFeeAnswerPath"],
    });
    record("Calculate", {
      auto: true,
      data: {
        fee: 10,
      },
    });
    record("Pay", { auto: false });

    expect(canGoBack(getCurrentCard())).toStrictEqual(false);
  });

  test("changing a component's answer", () => {
    record("Question", {
      auto: false,
      answers: ["FeeAnswerPath"],
    });
    record("Calculate", {
      auto: true,
      data: {
        fee: 10,
      },
    });
    record("Pay", { auto: false });
    changeAnswer("Confirmation");

    expect(canGoBack(getCurrentCard())).toStrictEqual(false);
  });
});
