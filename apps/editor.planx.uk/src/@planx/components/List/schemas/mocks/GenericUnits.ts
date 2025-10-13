import { Schema } from "@planx/components/shared/Schema/model";

import { Props } from "../../Public";

export const GenericUnitsTest: Schema = {
  type: "Unit",
  fields: [
    // fn = "development" triggers summary stat and options set "val"
    {
      type: "question",
      data: {
        title: "What development does this unit result from?",
        fn: "development",
        options: [
          { id: "newBuild", data: { text: "New build", val: "newBuild" } },
          {
            id: "changeOfUseFrom",
            data: {
              text: "Change of use of existing single home",
              val: "changeOfUseFrom",
            },
          },
          {
            id: "changeOfUseTo",
            data: { text: "Change of use to a home", val: "changeOfUseTo" },
          },
        ],
      },
    },
    // options set "text" only
    {
      type: "question",
      data: {
        title: "Is this unit built on garden land?",
        fn: "garden",
        options: [
          { id: "true", data: { text: "Yes" } },
          { id: "false", data: { text: "No" } },
        ],
      },
    },
    // fn = "identicalUnits" triggers summary stat
    {
      type: "number",
      data: {
        title: "How many identical units does the description above apply to?",
        fn: "identicalUnits",
        allowNegatives: false,
      },
    },
  ],
  min: 1,
} as const;

export const mockUnitsProps: Props = {
  fn: "proposal.units.residential",
  schema: GenericUnitsTest,
  schemaName: "Generic residential units",
  title: "Describe residential units",
};

export const mockUnitsPayload = {
  data: {
    "proposal.units.residential": [
      {
        development: "newBuild",
        garden: "Yes",
        identicalUnits: 1,
      },
      {
        development: "newBuild",
        garden: "No",
        identicalUnits: 2,
      },
      {
        development: "changeOfUseTo",
        garden: "No",
        identicalUnits: 2,
      },
    ],
    "proposal.units.residential.one.development": "newBuild",
    "proposal.units.residential.one.garden": "Yes",
    "proposal.units.residential.one.identicalUnits": 1,
    "proposal.units.residential.two.development": "newBuild",
    "proposal.units.residential.two.garden": "No",
    "proposal.units.residential.two.identicalUnits": 2,
    "proposal.units.residential.three.development": "changeOfUseTo",
    "proposal.units.residential.three.garden": "No",
    "proposal.units.residential.three.identicalUnits": 2,
    "proposal.units.residential.total.listItems": 3,
    "proposal.units.residential.total.units": 5,
    "proposal.units.residential.total.units.development.newBuild": 3,
    "proposal.units.residential.total.units.development.changeOfUseTo": 2,
  },
};
