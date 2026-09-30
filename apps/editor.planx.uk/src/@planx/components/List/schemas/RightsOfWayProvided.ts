import type { Schema } from "@planx/components/shared/Schema/model";
import { TextInputType } from "@planx/components/TextInput/model";

export const RightsOfWayProvided: Schema = {
  type: "New paths to be provided",
  fields: [
    {
      type: "question",
      data: {
        title: "What best describes the type of this path?",
        fn: "type",
        options: [
          { id: "footpath", data: { text: "Footpath", val: "footpath" } },
          {
            id: "Bridleway",
            data: { text: "Bridleway", val: "Bridleway" },
          },
          {
            id: "Byway",
            data: { text: "Byway", val: "Byway" },
          },
        ],
        description: "Byways include Roads Used as Public Paths.",
      },
    },
    {
      type: "text",
      data: {
        title: "General description of the path and its route",
        fn: "description",
        type: TextInputType.Long,
        description: "Include 8 figure O.S. grid references where known.",
      },
      required: false,
    },
    {
      type: "text",
      data: {
        title:
          "How are the start and end points of this path identified on the submitted plans?",
        fn: "identifier",
        type: TextInputType.Short,
        description: "For example A-B.",
      },
    },
    {
      type: "number",
      data: {
        title: "What is the proposed length of this path?",
        units: "m",
        fn: "length",
        allowNegatives: false,
      },
    },
    {
      type: "number",
      data: {
        title: "What is the proposed width of this path?",
        units: "m",
        fn: "width",
        allowNegatives: false,
      },
    },
  ],
  min: 1,
} as const;
