import { TextInputType } from "@planx/components/TextInput/model";

import { Schema } from "../../model";
import { Props } from "../../Public";

/**
 * Temp simple example to build out UI
 * Can be re-used as mock for testing
 */
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
  ],
  min: 1,
  max: 3,
} as const;

export const mockZooProps: Props = {
  fn: "mockFn",
  schema: Zoo,
  schemaName: "Zoo",
  title: "Mock Title",
  description: "Mock description",
};

export const mockZooPayload = {
  data: {
    mockFn: [
      {
        age: 10,
        "cuteness.amount": "Very",
        "email.address": "richard.parker@pi.com",
        name: "Richard Parker",
        size: "Medium",
      },
      {
        age: 10,
        "cuteness.amount": "Very",
        "email.address": "richard.parker@pi.com",
        name: "Richard Parker",
        size: "Medium",
      },
    ],
    "mockFn.one.age": 10,
    "mockFn.one.cuteness.amount": "Very",
    "mockFn.one.email.address": "richard.parker@pi.com",
    "mockFn.one.name": "Richard Parker",
    "mockFn.one.size": "Medium",
    "mockFn.two.age": 10,
    "mockFn.two.cuteness.amount": "Very",
    "mockFn.two.email.address": "richard.parker@pi.com",
    "mockFn.two.name": "Richard Parker",
    "mockFn.two.size": "Medium",
    "mockFn.total.listItems": 2,
  },
};
