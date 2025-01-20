import { Store, useStore } from "../../store";
import { clickContinue } from "../utils";

const { getState, setState } = useStore;
const { collectedFlags, resetPreview } = getState();

describe("Collecting flags", () => {
  beforeEach(() => {
    resetPreview();
  });

  test("Correctly collects flags based on an option's `data.flags` prop", () => {
    setState({ flow });

    // Manually proceed through a Question that sets multiple flags on a single option
    clickContinue("Question", { answers: ["YesOption"], auto: false });

    expect(collectedFlags()).toEqual({
      "Community infrastructure levy": ["Relief"], // Flag value translated to display text
      "Demolition in a conservation area": [],
      "Works to listed buildings": [],
      "Material change of use": [],
      "Planning permission": ["Prior approval", "Notice"], // Many flags in same category are ordered highest to lowest, even if selected in opposite order
      "Planning policy": ["Edge case"],
      "Works to trees & hedges": [],
    });
  });

  test("Returns empty arrays for each category if no flags have been collected", () => {
    setState({ flow });

    // Manually proceed through a Question option without flags
    clickContinue("Question", { answers: ["NoOption"], auto: false });

    expect(collectedFlags()).toEqual({
      "Community infrastructure levy": [],
      "Demolition in a conservation area": [],
      "Works to listed buildings": [],
      "Material change of use": [],
      "Planning permission": [],
      "Planning policy": [],
      "Works to trees & hedges": [],
    });
  });
});

const flow: Store.Flow = {
  _root: {
    edges: ["Question"],
  },
  Question: {
    type: 100,
    data: {
      text: "Pick up flags?",
      neverAutoAnswer: false,
    },
    edges: ["YesOption", "NoOption"],
  },
  YesOption: {
    type: 200,
    data: {
      text: "Yes",
      flags: ["PP-NOTICE", "EDGE_CASE", "CO_RELIEF", "PRIOR_APPROVAL"],
    },
  },
  NoOption: {
    type: 200,
    data: {
      text: "No",
    },
  },
};
