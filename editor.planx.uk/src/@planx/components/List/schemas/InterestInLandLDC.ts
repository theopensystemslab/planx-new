import { Schema } from "@planx/components/shared/Schema/model";
import { TextInputType } from "@planx/components/TextInput/model";

export const InterestInLandLDC: Schema = {
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
      type: "text",
      data: {
        title: "What's their interest in the land?",
        fn: "interest",
        type: TextInputType.Short,
      },
    },
    {
      type: "question",
      data: {
        title: "Have you notified them?",
        fn: "noticeGiven",
        options: [
          {
            id: "yes",
            data: { text: "Yes", val: "true" },
          },
          {
            id: "no",
            data: { text: "No", val: "false" },
          },
        ],
      },
    },
    {
      type: "text",
      required: false,
      data: {
        title: "If they have not been notified, explain why not",
        fn: "noNoticeReason",
        type: TextInputType.Short,
      },
    },
  ],
  min: 1,
} as const;
