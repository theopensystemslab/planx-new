import { Schema } from "@planx/components/shared/Schema/model";
import { TextInputType } from "@planx/components/TextInput/model";

import { Props } from "../../Public";

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
        food: ["meat", "leaves", "bamboo"],
        birthday: "1988-07-14",
      },
      {
        age: 10,
        "cuteness.amount": "Very",
        "email.address": "richard.parker@pi.com",
        name: "Richard Parker",
        size: "Medium",
        food: ["meat", "leaves", "bamboo"],
        birthday: "1988-07-14",
      },
    ],
    "mockFn.one.age": 10,
    "mockFn.one.cuteness.amount": "Very",
    "mockFn.one.email.address": "richard.parker@pi.com",
    "mockFn.one.name": "Richard Parker",
    "mockFn.one.size": "Medium",
    "mockFn.one.food": ["meat", "leaves", "bamboo"],
    "mockFn.one.birthday": "1988-07-14",
    "mockFn.two.age": 10,
    "mockFn.two.cuteness.amount": "Very",
    "mockFn.two.email.address": "richard.parker@pi.com",
    "mockFn.two.name": "Richard Parker",
    "mockFn.two.size": "Medium",
    "mockFn.two.food": ["meat", "leaves", "bamboo"],
    "mockFn.two.birthday": "1988-07-14",
    "mockFn.total.listItems": 2,
  },
};
