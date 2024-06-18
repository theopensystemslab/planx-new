import { Schema } from "@planx/components/List/model";

export const ExistingAndProposedUsesGLA: Schema = {
  type: "Existing and proposed uses",
  fields: [
    {
      type: "question",
      data: {
        title: "What is the use class?",
        fn: "useClass",
        options: [
          { id: "bTwo", data: { text: "B2 - General industry", val: "bTwo" } },
          {
            id: "bEight",
            data: { text: "B8 - Storage and distribution", val: "bEight" },
          },
          { id: "cOne", data: { text: "C1 - Hotels", val: "cOne" } },
          {
            id: "cTwo",
            data: { text: "C2 - Residential institutions", val: "cTwo" },
          },
          {
            id: "cTwoA",
            data: {
              text: "C2a - Secure residential institutions",
              val: "cTwoA",
            },
          },
          {
            id: "cThree",
            data: { text: "C3 - Dwellinghouses", val: "cThree" },
          },
          {
            id: "cFour",
            data: { text: "C4 - Houses in multiple occupation", val: "cFour" },
          },
          {
            id: "e",
            data: { text: "E - Commercial, business and service", val: "e" },
          },
          {
            id: "fOne",
            data: {
              text: "F1 - Learning and non-residential institutions",
              val: "fOne",
            },
          },
          {
            id: "fTwo",
            data: { text: "F2 - Local community uses", val: "fTwo" },
          },
          { id: "SG", data: { text: "Sui generis", val: "SG" } },
          { id: "unknown", data: { text: "Unknown", val: "unknown" } },
        ],
      },
    },
    {
      type: "number",
      data: {
        title: "What is the existing gross internal floor area?",
        units: "m²",
        fn: "area.existing",
        allowNegatives: false,
      },
    },
    {
      type: "number",
      data: {
        title: "What is the gross internal floor area lost?",
        units: "m²",
        fn: "area.loss",
        allowNegatives: false,
      },
    },
    {
      type: "number",
      data: {
        title: "What is the gross internal floor area gained?",
        units: "m²",
        fn: "area.gain",
        allowNegatives: false,
      },
    },
  ],
  min: 1,
} as const;
