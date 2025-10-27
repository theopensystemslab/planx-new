import { expect } from "vitest";

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
        address: {
          line1: "134 Corstorphine Rd",
          line2: "Corstorphine",
          town: "Edinburgh",
          county: "Midlothian",
          postcode: "EH12 6TS",
          country: "Scotland",
        },
        "photographs.existing": [
          {
            file: {
              path: "./test1.png",
              relativePath: "./test1.png",
            },
            // IDs are generated at runtime and cannot be pre-determined
            id: expect.any(String),
            progress: 1,
            status: "success",
            url: "https://api.editor.planx.dev/file/private/mock-nanoid/test1.png",
          },
          {
            file: {
              path: "./test2.png",
              relativePath: "./test2.png",
            },
            id: expect.any(String),
            progress: 1,
            status: "success",
            url: "https://api.editor.planx.dev/file/private/mock-nanoid/test2.png",
          },
        ],
      },
      {
        age: 10,
        "cuteness.amount": "Very",
        "email.address": "richard.parker@pi.com",
        name: "Richard Parker",
        size: "Medium",
        food: ["meat", "leaves", "bamboo"],
        birthday: "1988-07-14",
        address: {
          line1: "134 Corstorphine Rd",
          line2: "Corstorphine",
          town: "Edinburgh",
          county: "Midlothian",
          postcode: "EH12 6TS",
          country: "Scotland",
        },
        "photographs.existing": [
          {
            file: {
              path: "./test1.png",
              relativePath: "./test1.png",
            },
            id: expect.any(String),
            progress: 1,
            status: "success",
            url: "https://api.editor.planx.dev/file/private/mock-nanoid/test1.png",
          },
          {
            file: {
              path: "./test2.png",
              relativePath: "./test2.png",
            },
            id: expect.any(String),
            progress: 1,
            status: "success",
            url: "https://api.editor.planx.dev/file/private/mock-nanoid/test2.png",
          },
        ],
      },
    ],
    "mockFn.one.age": 10,
    "mockFn.one.cuteness.amount": "Very",
    "mockFn.one.email.address": "richard.parker@pi.com",
    "mockFn.one.name": "Richard Parker",
    "mockFn.one.size": "Medium",
    "mockFn.one.food": ["meat", "leaves", "bamboo"],
    "mockFn.one.birthday": "1988-07-14",
    "mockFn.one.address": {
      line1: "134 Corstorphine Rd",
      line2: "Corstorphine",
      town: "Edinburgh",
      county: "Midlothian",
      postcode: "EH12 6TS",
      country: "Scotland",
    },
    "mockFn.two.age": 10,
    "mockFn.two.cuteness.amount": "Very",
    "mockFn.two.email.address": "richard.parker@pi.com",
    "mockFn.two.name": "Richard Parker",
    "mockFn.two.size": "Medium",
    "mockFn.two.food": ["meat", "leaves", "bamboo"],
    "mockFn.two.birthday": "1988-07-14",
    "mockFn.two.address": {
      line1: "134 Corstorphine Rd",
      line2: "Corstorphine",
      town: "Edinburgh",
      county: "Midlothian",
      postcode: "EH12 6TS",
      country: "Scotland",
    },
    "mockFn.total.listItems": 2,
    "photographs.existing": [
      {
        file: {
          path: "./test1.png",
          relativePath: "./test1.png",
        },
        id: expect.any(String),
        progress: 1,
        status: "success",
        url: "https://api.editor.planx.dev/file/private/mock-nanoid/test1.png",
      },
      {
        file: {
          path: "./test2.png",
          relativePath: "./test2.png",
        },
        id: expect.any(String),
        progress: 1,
        status: "success",
        url: "https://api.editor.planx.dev/file/private/mock-nanoid/test2.png",
      },
      {
        file: {
          path: "./test1.png",
          relativePath: "./test1.png",
        },
        id: expect.any(String),
        progress: 1,
        status: "success",
        url: "https://api.editor.planx.dev/file/private/mock-nanoid/test1.png",
      },
      {
        file: {
          path: "./test2.png",
          relativePath: "./test2.png",
        },
        id: expect.any(String),
        progress: 1,
        status: "success",
        url: "https://api.editor.planx.dev/file/private/mock-nanoid/test2.png",
      },
    ],
  },
};
