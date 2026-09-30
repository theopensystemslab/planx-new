import type { Schema } from "@planx/components/shared/Schema/model";
import { TextInputType } from "@planx/components/TextInput/model";

export const RightsOfWayAffected: Schema = {
  type: "Existing paths affected by the proposal",
  fields: [
    {
      type: "text",
      data: {
        title: "Path reference number (if known)",
        fn: "referenceNo",
        type: TextInputType.Short,
      },
      required: false,
    },
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
        title: "What is the length of this path?",
        units: "m",
        fn: "length",
        allowNegatives: false,
      },
    },
    {
      type: "number",
      data: {
        title: "What is the width of this path (if defined)?",
        units: "m",
        fn: "width",
        allowNegatives: false,
      },
      required: false,
    },
  ],
  min: 1,
} as const;
