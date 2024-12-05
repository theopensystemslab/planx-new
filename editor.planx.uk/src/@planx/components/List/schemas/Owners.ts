import { Schema } from "@planx/components/shared/Schema/model";
import { TextInputType } from "@planx/components/TextInput/model";

export const Owners: Schema = {
  type: "Person",
  fields: [
    {
      type: "question",
      data: {
        title: "What is the nature of their interest in the land?",
        fn: "interest",
        options: [
          {
            id: "owner",
            data: { text: "Owner", val: "owner" },
          },
          {
            id: "lessee",
            data: { text: "Lessee", val: "lessee" },
          },
          {
            id: "occupier",
            data: { text: "Occupier", val: "occupier" },
          },
          {
            id: "other",
            data: { text: "Something else", val: "other" },
          },
        ],
      },
    },
    {
      type: "text",
      data: {
        title: "What is their full name?",
        fn: "name",
        type: TextInputType.Short,
      },
    },
    {
      type: "address",
      data: {
        title: "What is their address?",
        fn: "address",
      },
    },
    {
      type: "question",
      data: {
        title: "Have you notified them?",
        description:
          "Anyone with an interest in the land should be notified before submitting this application.",
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
  ],
  min: 1,
} as const;
