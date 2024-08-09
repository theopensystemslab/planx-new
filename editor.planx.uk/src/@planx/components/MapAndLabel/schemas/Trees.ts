import { Schema } from "@planx/components/List/model";
import { TextInputType } from "@planx/components/TextInput/model";

export const Trees: Schema = {
  type: "Tree",
  fields: [
    {
      type: "text",
      data: {
        title: "Species",
        fn: "species",
        type: TextInputType.Short,
      },
    },
    {
      type: "text",
      data: {
        title: "Proposed work",
        fn: "work",
        type: TextInputType.Short,
      },
    },
    {
      type: "text",
      data: {
        title: "Justification",
        fn: "justification",
        type: TextInputType.Short,
      },
    },
    {
      type: "question",
      data: {
        title: "Urgency",
        fn: "urgency",
        options: [
          {
            id: "low",
            data: { text: "Low", val: "low" },
          },
          {
            id: "moderate",
            data: { text: "Moderate", val: "moderate" },
          },
          {
            id: "high",
            data: { text: "High", val: "high" },
          },
          {
            id: "urgent",
            data: { text: "Urgent", val: "urgent" },
          },
        ],
      },
    },
    {
      type: "text",
      data: {
        title: "Expected completion date",
        fn: "completionDate",
        type: TextInputType.Short,
      },
    },
  ],
  min: 1,
} as const;
