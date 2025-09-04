import { Schema } from "@planx/components/shared/Schema/model";
import { TextInputType } from "@planx/components/TextInput/model";

export const SketchPlanFullDescriptionTPO: Schema = {
  type: "Tree",
  fields: [
    {
      type: "text",
      required: false,
      data: {
        title: "TPO reference number",
        description:
          "As shown in the First Schedule of the Tree Preservation Order.",
        fn: "referenceNumber",
        type: TextInputType.Short,
      },
    },
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
        title: "Description of location",
        description: "For example 'rear garden'.",
        fn: "locationDescription",
        type: TextInputType.Short,
      },
    },
    {
      type: "text",
      data: {
        title: "Size or age class",
        description: "For example 'mature (80cm diameter)'.",
        fn: "sizeOrAgeClass",
        type: TextInputType.Short,
      },
    },
    {
      type: "text",
      required: false,
      data: {
        title: "Proposed work",
        fn: "work",
        type: TextInputType.Short,
      },
    },
    {
      type: "text",
      required: false,
      data: {
        title: "Reasons for the proposed work",
        fn: "reason",
        type: TextInputType.Short,
      },
    },
  ],
  min: 1,
} as const;
