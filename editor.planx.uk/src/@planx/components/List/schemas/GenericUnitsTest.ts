import { Schema } from "@planx/components/List/model";

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
