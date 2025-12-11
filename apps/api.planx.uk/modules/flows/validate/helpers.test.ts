import type { FlowGraph } from "@opensystemslab/planx-core/types";
import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";

import {
  buildNodeTypeSet,
  hasComponentType,
  numberOfComponentType,
} from "./helpers.js";

describe("hasComponentType", () => {
  test("it returns true for a component type that is present", () => {
    expect(hasComponentType(flow, TYPES.Question)).toEqual(true);
  });

  test("it returns false for a component type that is not present", () => {
    expect(hasComponentType(flow, TYPES.DrawBoundary)).toEqual(false);
  });

  test("it returns true for a component type that is present and has the specified data field as a `val` prop", () => {
    expect(hasComponentType(flow, TYPES.Answer, "residential.flat")).toEqual(
      true,
    );
  });

  test("it returns true for a component type that is present and has the specified data field as a `fn` prop", () => {
    expect(hasComponentType(flow, TYPES.Question, "property.type")).toEqual(
      true,
    );
  });

  test("it returns false for a component type that is present but does not have the specified data field", () => {
    expect(hasComponentType(flow, TYPES.Question, "application.type")).toEqual(
      false,
    );
  });
});

describe("buildNodeTypeSet", () => {
  const nodeTypeSet = buildNodeTypeSet(flow);

  test("it returns true for a component type that is present", () => {
    expect(nodeTypeSet.has(TYPES.Question)).toEqual(true);
  });

  test("it returns false for a component type that is not present", () => {
    expect(nodeTypeSet.has(TYPES.DrawBoundary)).toEqual(false);
  });
});

describe("numberOfComponentType", () => {
  test("it returns the correct count of nested component types", () => {
    expect(numberOfComponentType(flow, TYPES.Answer)).toEqual(5);
  });

  test("it returns the correct count of component types with a specified data field as a `fn` prop", () => {
    expect(
      numberOfComponentType(flow, TYPES.Question, "property.type"),
    ).toEqual(2);
  });

  test("it returns the correct count of component types with a specified data field as a `val` prop", () => {
    expect(numberOfComponentType(flow, TYPES.Answer, "residential")).toEqual(1);
  });

  test("it returns 0 for a component type that is not present", () => {
    expect(numberOfComponentType(flow, TYPES.Calculate)).toEqual(0);
  });

  test("it returns 0 for a component type that is present but does not have the specified data field", () => {
    expect(
      numberOfComponentType(flow, TYPES.Question, "application.type"),
    ).toEqual(0);
  });
});

const flow: FlowGraph = {
  _root: {
    edges: ["FindProperty", "QuestionOne", "Result", "Notice"],
  },
  "4jSYMB7hBJ": {
    data: {
      val: "residential.house",
      text: "House",
      flags: ["flag.pp.permittedDevelopment"],
    },
    type: TYPES.Answer,
  },
  FindProperty: {
    data: {
      title: "Find the property",
      newAddressTitle:
        "Click or tap at where the property is on the map and name it below",
      allowNewAddresses: false,
      newAddressDescription:
        "You will need to select a location and provide a name to continue",
      newAddressDescriptionLabel: "Name the site",
    },
    type: TYPES.FindProperty,
  },
  Notice: {
    data: {
      color: "#EFEFEF",
      title: "End of test",
      resetButton: true,
    },
    type: TYPES.Notice,
  },
  QJeTHUDzfz: {
    data: {
      text: "Something else",
      flags: ["flag.pp.missingInfo"],
    },
    type: TYPES.Answer,
  },
  QuestionTwo: {
    data: {
      fn: "property.type",
      tags: [],
      text: "What type of residence is it?",
      neverAutoAnswer: false,
    },
    type: TYPES.Question,
    edges: ["4jSYMB7hBJ", "xHpGvCpm0y", "QJeTHUDzfz"],
  },
  oaF6TgEGZO: {
    data: {
      val: "residential",
      text: "Residential",
      flags: ["flag.pp.permittedDevelopment"],
    },
    type: TYPES.Answer,
    edges: ["QuestionTwo"],
  },
  QuestionOne: {
    data: {
      fn: "property.type",
      tags: [],
      text: "What type of property is it?",
      neverAutoAnswer: false,
    },
    type: TYPES.Question,
    edges: ["oaF6TgEGZO", "tgP6NiYImY"],
  },
  tgP6NiYImY: {
    data: {
      text: "Something else",
      flags: ["flag.pp.missingInfo"],
    },
    type: TYPES.Answer,
  },
  xHpGvCpm0y: {
    data: {
      val: "residential.flat",
      text: "Flat",
      flags: ["flag.pp.permissionNeeded"],
    },
    type: TYPES.Answer,
  },
  Result: {
    data: {
      flagSet: "Planning permission",
    },
    type: TYPES.Result,
  },
};
