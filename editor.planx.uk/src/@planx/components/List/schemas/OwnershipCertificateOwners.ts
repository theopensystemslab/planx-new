import { Schema } from "@planx/components/shared/Schema/model";
import { TextInputType } from "@planx/components/TextInput/model";

export const OwnershipCertificateOwners: Schema = {
  type: "Person",
  fields: [
    {
      type: "text",
      data: {
        title: "Full name",
        fn: "name",
        type: TextInputType.Short,
      },
    },
    {
      type: "address",
      data: {
        title: "Address",
        fn: "address",
      },
    },
    {
      type: "date",
      data: {
        title: "When was notice given to them?",
        fn: "noticeDate",
      },
    },
  ],
  min: 1,
} as const;
