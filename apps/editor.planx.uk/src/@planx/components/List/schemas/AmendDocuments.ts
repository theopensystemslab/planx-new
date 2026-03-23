import { Schema } from "@planx/components/shared/Schema/model";
import { TextInputType } from "@planx/components/TextInput/model";

export const AmendDocuments: Schema = {
  type: "Document",
  fields: [
    {
      type: "fileUpload",
      data: {
        title: "Upload a document",
        fn: "otherDocument",
        maxFiles: 1,
      },
    },
    {
      type: "text",
      required: false,
      data: {
        title: "Previous document reference",
        description:
          "If you are amending a previously submitted document, add its reference here.",
        fn: "previousReference",
        type: TextInputType.Short,
      },
    },
    {
      type: "text",
      data: {
        title: "New document reference",
        description:
          "This is the reference for the document you are submitting.",
        fn: "newReference",
        type: TextInputType.Short,
      },
    },
  ],
  min: 1,
} as const;
