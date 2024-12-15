import { Schema } from "@planx/components/shared/Schema/model";
import { TextInputType } from "@planx/components/TextInput/model";

export const ExistingBuildingsCIL: Schema = {
  type: "Existing building or part of building",
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
        title: "How much of its floorspace will be retained?",
        units: "m²",
        fn: "areaRetained",
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
        title: "How much of its floorspace will be lost?",
        units: "m²",
        fn: "areaDemolished",
        allowNegatives: false,
      },
    },
    {
      type: "question",
      data: {
        title:
          "Has the building or part been lawfully occupied for 6 continuous months in the past 36 months (excluding temporarily lawful uses)?",
        fn: "continuousOccupation",
        options: [
          { id: "true", data: { text: "Yes", val: "true" } },
          { id: "false", data: { text: "No", val: "false" } },
        ],
      },
    },
    {
      type: "text",
      data: {
        title: "When was it last occupied for its lawful use?",
        description: "Please enter a date or whether it is still in use.",
        fn: "lastOccupation",
        type: TextInputType.Short,
      },
    },
  ],
  min: 1,
} as const;
