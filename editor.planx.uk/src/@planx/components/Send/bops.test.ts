import { TYPES } from "../types";
import { makePayload } from "./bops";

test("makes a more advanced payload", () => {
  const flow = {
    _root: {
      edges: [
        "9MOwkWbaQk",
        "d8up0QZ5c7",
        "UxwdVmsGmn",
        "Lt1vhc91Ae",
        "8kKGIvNzEN",
      ],
    },
    d8up0QZ5c7: {
      type: TYPES.Statement,
      data: {
        text: "is the property in this specific region?",
      },
      edges: ["gHp8xtlx36", "xy9EO8mA13"],
    },
    gHp8xtlx36: {
      type: TYPES.Response,
      data: {
        text: "yes",
      },
    },
    xy9EO8mA13: {
      type: TYPES.Response,
      data: {
        text: "no",
      },
    },
    "9MOwkWbaQk": {
      type: TYPES.Checklist,
      data: {
        allRequired: false,
        text: "what are you planning to do?",
      },
      edges: ["2p2ZJhTW63", "0mri6OiU0M", "a4ZWUug077"],
    },
    "2p2ZJhTW63": {
      data: {
        text: "demolish",
      },
      type: TYPES.Response,
    },
    "0mri6OiU0M": {
      data: {
        text: "merge",
      },
      type: TYPES.Response,
    },
    a4ZWUug077: {
      data: {
        text: "build new",
      },
      type: TYPES.Response,
    },
    UxwdVmsGmn: {
      type: TYPES.Statement,
      data: {
        text:
          "will the new build's footprint occupy more than 50% available land?",
        policyRef: "<p><code>Southwark SPD figure 123.31</code></p>\n",
      },
      edges: ["oULA5kx0NK", "BVWlOioEYE"],
    },
    oULA5kx0NK: {
      type: TYPES.Response,
      data: {
        text: "yes",
      },
    },
    BVWlOioEYE: {
      type: TYPES.Response,
      data: {
        text: "no",
      },
    },
    Lt1vhc91Ae: {
      type: TYPES.Statement,
      data: {
        text: "when was the original property built?",
      },
      edges: ["bc4qu832vd", "xBXS2yRjw7"],
    },
    bc4qu832vd: {
      type: TYPES.Response,
      data: {
        text: "before 2000",
      },
    },
    xBXS2yRjw7: {
      type: TYPES.Response,
      data: {
        text: "don't know",
        flag: "MISSING_INFO",
      },
    },
    "8kKGIvNzEN": {
      type: TYPES.TextInput,
      data: {
        title: "please describe the project",
      },
    },
  };

  const breadcrumbs = {
    "9MOwkWbaQk": {
      answers: ["2p2ZJhTW63", "a4ZWUug077"],
      auto: false,
    },
    d8up0QZ5c7: {
      answers: ["xy9EO8mA13"],
      auto: true,
    },
    UxwdVmsGmn: {
      answers: ["oULA5kx0NK"],
      auto: false,
    },
    Lt1vhc91Ae: {
      answers: ["xBXS2yRjw7"],
      auto: false,
    },
    "8kKGIvNzEN": {
      answers: ["extension demolition followed by a rebuild"],
      auto: false,
    },
  };

  expect(makePayload(flow, breadcrumbs)).toEqual([
    {
      question: "what are you planning to do?",
      responses: [
        {
          value: "demolish",
        },
        {
          value: "build new",
        },
      ],
    },
    {
      question: "is the property in this specific region?",
      metadata: {
        auto_answered: true,
      },
      responses: [
        {
          value: "no",
        },
      ],
    },
    {
      question:
        "will the new build's footprint occupy more than 50% available land?",
      metadata: {
        policy_refs: [
          // TODO: split policy refs into multiple text?/url? objects
          { text: "Southwark SPD figure 123.31" },
        ],
      },
      responses: [
        {
          value: "yes",
        },
      ],
    },
    {
      question: "when was the original property built?",
      responses: [
        {
          value: "don't know",
          metadata: {
            flags: ["Planning permission / Missing information"],
          },
        },
      ],
    },
    {
      question: "please describe the project",
      responses: [
        {
          value: "extension demolition followed by a rebuild",
        },
      ],
    },
  ]);
});
