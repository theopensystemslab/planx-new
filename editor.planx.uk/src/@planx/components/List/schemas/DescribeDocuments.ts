import { Schema } from "@planx/components/shared/Schema/model";
import { TextInputType } from "@planx/components/TextInput/model";

export const DescribeDocuments: Schema = {
  type: "Document",
  fields: [
    {
      type: "fileUpload",
      data: {
        title: "Upload a document",
        fn: "otherDocument",
      },
    },
    {
      type: "text",
      data: {
        title: "Describe the document",
        fn: "description",
        type: TextInputType.Short,
      },
    },
  ],
  min: 1,
} as const;
