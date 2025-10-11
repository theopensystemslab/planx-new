import { Schema } from "@planx/components/shared/Schema/model";
import { TextInputType } from "@planx/components/TextInput/model";

export const ExistingBuildingsCIL: Schema = {
  type: "Building or part of building",
  fields: [
    {
      type: "text",
      data: {
        title: "Describe the existing building or part",
        fn: "descriptionExisting",
        type: TextInputType.Short,
      },
    },
    {
      type: "number",
      data: {
        title: "How much floorspace will be retained?",
        units: "m²",
        fn: "area.retained",
        allowNegatives: false,
      },
    },
    {
      type: "text",
      data: {
        title: "What will the retained floorspace be used for?",
        description: "This can be identical to its current use.",
        fn: "descriptionProposed",
        type: TextInputType.Short,
      },
    },
    {
      type: "number",
      data: {
        title: "How much floorspace will be lost?",
        units: "m²",
        fn: "area.loss",
        allowNegatives: false,
      },
    },
    {
      type: "question",
      data: {
        title:
          "Has the building or part been lawfully occupied for 6 continuous months in the past 36 months?",
        fn: "continuousOccupation",
        options: [
          { id: "true", data: { text: "Yes", val: "true" } },
          { id: "false", data: { text: "No", val: "false" } },
        ],
      },
    },
    {
      type: "question",
      data: {
        title: "Is the building or part currently occupied?",
        fn: "stillInUse",
        options: [
          { id: "true", data: { text: "Yes", val: "true" } },
          { id: "false", data: { text: "No", val: "false" } },
        ],
      },
    },
    {
      type: "date",
      required: false,
      data: {
        title: "If not currently occupied, enter the date it was last occupied",
        fn: "lastOccupation",
      },
    },
  ],
  min: 1,
} as const;
