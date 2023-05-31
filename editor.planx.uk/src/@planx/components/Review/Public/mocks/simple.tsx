export const mockedBreadcrumbs = {
  ZM31xEWH2c: {
    auto: false,
    data: {
      ZM31xEWH2c: 356,
    },
  },
  "1A14DTRw0d": {
    auto: false,
    data: {
      "1A14DTRw0d": "This is a text",
    },
  },
  duzkfXlWGn: {
    auto: false,
    answers: ["iWvI9QkgIT"],
  },
};

export const mockedPassport = {
  data: {
    ZM31xEWH2c: 356,
    "1A14DTRw0d": "This is a text",
  },
};

export const mockedFlow = {
  _root: { edges: ["ZM31xEWH2c", "1A14DTRw0d", "duzkfXlWGn", "EJBY2zSbmL"] },
  "1A14DTRw0d": { data: { title: "Input a text" }, type: 110 },
  EJBY2zSbmL: { type: 600 },
  ZM31xEWH2c: { data: { title: "Input a number" }, type: 150 },
  duzkfXlWGn: {
    data: { text: "Select the desired options", allRequired: false },
    type: 105,
    edges: ["ky2QQWHgi5", "iWvI9QkgIT", "nyYCBQs24s"],
  },
  iWvI9QkgIT: { data: { text: "Option 2" }, type: 200 },
  ky2QQWHgi5: { data: { text: "Option 1" }, type: 200 },
  nyYCBQs24s: { data: { text: "Option 3" }, type: 200 },
};
