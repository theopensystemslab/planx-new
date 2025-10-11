import { Schema } from "@planx/components/shared/Schema/model";
import { TextInputType } from "@planx/components/TextInput/model";

export const Zoo: Schema = {
  type: "Animal",
  fields: [
    // Text - short
    {
      type: "text",
      data: {
        title: "What's their name?",
        description: "Please make it cute",
        fn: "name",
        type: TextInputType.Short,
      },
    },
    // Text - email
    {
      type: "text",
      data: {
        title: "What's their email address?",
        fn: "email.address",
        type: TextInputType.Email,
      },
    },
    // Number
    {
      type: "number",
      data: {
        title: "How old are they?",
        fn: "age",
        units: "years old",
        allowNegatives: false,
      },
    },
    // Question - multiple options
    {
      type: "question",
      data: {
        title: "What size are they?",
        fn: "size",
        options: [
          { id: "small", data: { text: "Small" } },
          { id: "medium", data: { text: "Medium" } },
          { id: "large", data: { text: "Large" } },
        ],
      },
    },
    // Question - only two options
    {
      type: "question",
      data: {
        title: "How cute are they?",
        fn: "cuteness.amount",
        options: [
          { id: "very", data: { text: "Very" } },
          { id: "super", data: { text: "Super" } },
        ],
      },
    },
    // Checklist
    {
      type: "checklist",
      data: {
        title: "What do they eat?",
        fn: "food",
        options: [
          { id: "meat", data: { text: "Meat" } },
          { id: "leaves", data: { text: "Leaves" } },
          { id: "bamboo", data: { text: "Bamboo" } },
          { id: "fruit", data: { text: "Fruit" } },
        ],
      },
    },
    // Date
    {
      type: "date",
      data: {
        title: "What's their birthday?",
        fn: "birthday",
        min: "1970-01-01",
        max: "2999-12-31",
      },
    },
    // Address
    {
      type: "address",
      data: {
        title: "What's their address?",
        fn: "address",
      },
    },
    // FileUpload
    {
      type: "fileUpload",
      data: {
        title: "Upload some photos of the animal",
        fn: "photographs.existing",
      },
    },
  ],
  min: 1,
  max: 3,
} as const;
