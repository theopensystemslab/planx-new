import { Store, useStore } from "../../store";
import { clickContinue } from "../utils";

const { getState, setState } = useStore;
const { collectedFlags, resetPreview } = getState();

describe("Collecting flags", () => {
  beforeEach(() => {
    resetPreview();
  });

  test("Correctly collects flags when an option's `data.flag` prop is the new array format", () => {
    setState({ flow: flowWithNewFlags });

    // Manually proceed through a Question that sets multiple flags on a single option
    clickContinue("Question", { answers: ["YesOption"], auto: false });

    expect(collectedFlags()).toEqual({
      "Community infrastructure levy": ["Relief"], // Flag value translated to display text
      "Demolition in a conservation area": [],
      "Listed building consent": [],
      "Material change of use": [],
      "Planning permission": ["Prior approval", "Notice"], // Many flags in same category are ordered highest to lowest, even if selected in opposite order
      "Planning policy": ["Edge case"],
      "Works to trees & hedges": [],
    });
  });

  test("Correctly collects flags when an option's `data.flag` prop is the legacy string format", () => {
    setState({ flow: flowWithLegacyFlags });

    // Manually proceed a Checklist and select every option that sets a single flag
    clickContinue("Checklist", {
      answers: [
        "PPImmuneOption",
        "PPImmune2Option",
        "PPPDOption",
        "WTTRequiredOption",
        "MCUYesOption",
      ],
      auto: false,
    });

    expect(collectedFlags()).toEqual({
      "Community infrastructure levy": [],
      "Demolition in a conservation area": [],
      "Listed building consent": [],
      "Material change of use": ["Material change of use"],
      "Planning permission": ["Immune", "Permitted development"], // Multiple flags of same value have been de-deduplicated
      "Planning policy": [],
      "Works to trees & hedges": ["Required"],
    });
  });

  test("Returns empty arrays for each category if no flags have been collected", () => {
    setState({ flow: flowWithNewFlags });

    // Manually proceed through a Question option without flags
    clickContinue("Question", { answers: ["NoOption"], auto: false });

    expect(collectedFlags()).toEqual({
      "Community infrastructure levy": [],
      "Demolition in a conservation area": [],
      "Listed building consent": [],
      "Material change of use": [],
      "Planning permission": [],
      "Planning policy": [],
      "Works to trees & hedges": [],
    });
  });
});

const flowWithNewFlags: Store.Flow = {
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
      flag: ["PP-NOTICE", "EDGE_CASE", "CO_RELIEF", "PRIOR_APPROVAL"], // `flag` is an array for freshly created/updated Question & Checklist options
    },
  },
  NoOption: {
    type: 200,
    data: {
      text: "No",
    },
  },
};

const flowWithLegacyFlags: Store.Flow = {
  _root: {
    edges: ["Checklist"],
  },
  Checklist: {
    type: 105,
    data: {
      allRequired: false,
      neverAutoAnswer: false,
      text: "Pick up flags?",
    },
    edges: [
      "PPImmuneOption",
      "PPImmune2Option",
      "PPPDOption",
      "WTTRequiredOption",
      "MCUYesOption",
    ],
  },
  PPImmuneOption: {
    data: {
      text: "PP Immune",
      flag: "IMMUNE",
    },
    type: 200,
  },
  PPImmune2Option: {
    data: {
      text: "PP Immune again",
      flag: "IMMUNE",
    },
    type: 200,
  },
  PPPDOption: {
    data: {
      text: "PP Permitted dev",
      flag: "NO_APP_REQUIRED",
    },
    type: 200,
  },
  WTTRequiredOption: {
    data: {
      text: "WTT Required",
      flag: "TR-REQUIRED",
    },
    type: 200,
  },
  MCUYesOption: {
    data: {
      text: "MCU Yes",
      flag: "MCOU_TRUE",
    },
    type: 200,
  },
};
