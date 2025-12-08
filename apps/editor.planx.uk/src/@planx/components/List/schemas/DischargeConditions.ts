import { Schema } from "@planx/components/shared/Schema/model";
import { TextInputType } from "@planx/components/TextInput/model";

export const DischargeConditions: Schema = {
  type: "Condition",
  fields: [
    {
      type: "text",
      data: {
        title: "Condition number",
        description:
          "This is the number of the condition as shown on the decision notice.",
        fn: "number",
        type: TextInputType.Short,
      },
    },
    {
      type: "text",
      data: {
        title: "Condition description",
        description:
          "This is the exact wording of the condition as shown on the decision notice.",
        fn: "description",
        type: TextInputType.Custom,
        customLength: 10000,
      },
    },
    {
      type: "question",
      data: {
        title:
          "Are you submitting details for the full condition or part of it?",
        fn: "scope",
        options: [
          { id: "full", data: { text: "The full condition", val: "full" } },
          {
            id: "part",
            data: { text: "Part of the condition", val: "part" },
          },
        ],
      },
    },
    {
      type: "text",
      required: false,
      data: {
        title: "Which part of the condition are you submitting details for?",
        fn: "scope.description",
        type: TextInputType.Short,
      },
    },
    {
      type: "fileUpload",
      data: {
        title: "Supporting documents",
        description:
          "The documents should detail how you intend to meet this condition.",
        fn: "otherSupporting",
      },
    },
  ],
  min: 1,
  max: 12,
} as const;
