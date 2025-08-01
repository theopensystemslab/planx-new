import { Store, useStore } from "../../store";
import { clickContinue } from "../utils";

const { getState, setState } = useStore;
const { resultData, resetPreview, collectedFlags } = getState();

describe("Default result data when no flags have been collected", () => {
  test("Returns the `No result` path for the `Planning permission` flagset category", () => {
    expect(resultData()).toEqual({
      "Planning permission": {
        displayText: {
          description: "Planning permission",
          heading: "No result",
        },
        flag: {
          bgColor: "#EEEEEE",
          category: "Planning permission",
          color: "#000000",
          text: "No result",
          value: "flag.pp.noResult",
        },
        responses: [],
      },
    });
  });
});

describe("Computing result data based on collected flags", () => {
  beforeEach(() => {
    resetPreview();
    setState({ flow });
  });

  test("Result is correct when many flags in the same category have been collected", () => {
    // Manually proceed through two Questions plus a TextInput
    clickContinue("ListedBuildingQuestion", {
      answers: ["ListedBuildingOptionYes"],
      auto: false,
    });
    clickContinue("MaterialQuestion", {
      answers: ["MaterialOptionNo"],
      auto: false,
    });
    clickContinue("TextInput", { data: { name: "Test" }, auto: false });

    const category = "Planning permission";
    const collectedPPFlags = collectedFlags()?.[category];
    expect(collectedPPFlags).toEqual([
      "Permission needed",
      "Permitted development",
    ]);

    // The result should be the first flag
    expect(resultData(category)?.[category]?.displayText).toEqual({
      description: category,
      heading: collectedPPFlags[0],
    });
    expect(resultData(category)?.[category]?.flag).toEqual({
      bgColor: "#A8A8A8",
      category: category,
      color: "#000000",
      text: collectedPPFlags[0],
      value: "flag.pp.permissionNeeded",
      description:
        "It looks like the proposed changes may require planning permission.",
    });
    expect(resultData(category)?.[category]?.responses).toHaveLength(2); // TextInput is omitted
  });

  test("Result is correct when a single flag in the category has been collected", () => {
    // Manually proceed through two Questions plus a TextInput
    clickContinue("ListedBuildingQuestion", {
      answers: ["ListedBuildingOptionYes"],
      auto: false,
    });
    clickContinue("MaterialQuestion", {
      answers: ["MaterialOptionNo"],
      auto: false,
    });
    clickContinue("TextInput", { data: { name: "Test" }, auto: false });

    const category = "Works to listed buildings";
    const collectedLBCFlags = collectedFlags()?.[category];
    expect(collectedLBCFlags).toEqual(["Consent needed"]);

    // The result should be the first flag
    expect(resultData(category)?.[category]?.displayText).toEqual({
      description: category,
      heading: collectedLBCFlags[0],
    });
    expect(resultData(category)?.[category]?.flag).toEqual({
      bgColor: "#76B4E5",
      category: category,
      color: "#000000",
      text: collectedLBCFlags[0],
      value: "flag.lbc.consentNeeded",
    });
    expect(resultData(category)?.[category]?.responses).toHaveLength(2); // TextInput is omitted
  });

  test("Result displays editor overrides if configured", () => {
    // Manually proceed through two Questions plus a TextInput
    clickContinue("ListedBuildingQuestion", {
      answers: ["ListedBuildingOptionYes"],
      auto: false,
    });
    clickContinue("MaterialQuestion", {
      answers: ["MaterialOptionNo"],
      auto: false,
    });
    clickContinue("TextInput", { data: { name: "Test" }, auto: false });

    const category = "Works to listed buildings";
    const collectedLBCFlags = collectedFlags()?.[category];
    expect(collectedLBCFlags).toEqual(["Consent needed"]);

    // The result should be the first flag
    const editorOverrides = {
      "flag.lbc.consentNeeded": {
        description: "This is a custom description",
      },
    };
    expect(
      resultData(category, editorOverrides)?.[category]?.displayText,
    ).toEqual({
      description: "This is a custom description",
      heading: collectedLBCFlags[0],
    });
  });
});

const flow: Store.Flow = {
  _root: {
    edges: [
      "ListedBuildingQuestion",
      "MaterialQuestion",
      "TextInput",
      "PlanningPermissionResult",
      "ListedBuildingConsentResult",
      "MaterialChangeOfUseResult",
    ],
  },
  MaterialOptionNo: {
    data: {
      flags: ["flag.mcou.false", "flag.pp.permittedDevelopment"],
      text: "No",
    },
    type: 200,
  },
  PlanningPermissionResult: {
    data: {
      flagSet: "Planning permission",
    },
    type: 3,
  },
  ListedBuildingOptionNo: {
    data: {
      flags: ["flag.lbc.notRequired"],
      text: "No",
    },
    type: 200,
  },
  MaterialChangeOfUseResult: {
    data: {
      flagSet: "Material change of use",
    },
    type: 3,
  },
  TextInput: {
    data: {
      fn: "name",
      type: "short",
      title: "What's your name? ",
    },
    type: 110,
  },
  MaterialQuestion: {
    data: {
      tags: [],
      text: "Are you changing the external cladding?",
      neverAutoAnswer: false,
    },
    type: 100,
    edges: ["MaterialOptionYes", "MaterialOptionNo"],
  },
  ListedBuildingConsentResult: {
    data: {
      flagSet: "Works to listed buildings",
      overrides: {
        "flag.lbc.consentNeeded": {
          description: "This is a custom description",
        },
      },
    },
    type: 3,
  },
  ListedBuildingQuestion: {
    data: {
      text: "Is it a Listed Building?",
      neverAutoAnswer: false,
    },
    type: 100,
    edges: ["ListedBuildingOptionYes", "ListedBuildingOptionNo"],
  },
  MaterialOptionYes: {
    data: {
      flags: ["flag.mcou.true", "flag.pp.permissionNeeded"],
      text: "Yes",
    },
    type: 200,
  },
  ListedBuildingOptionYes: {
    data: {
      flags: ["flag.pp.permissionNeeded", "flag.lbc.consentNeeded"],
      text: "Yes",
    },
    type: 200,
  },
};
