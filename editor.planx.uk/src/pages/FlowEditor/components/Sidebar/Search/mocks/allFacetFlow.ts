import { FlowGraph, IndexedNode } from "@opensystemslab/planx-core/types";

import { SearchResult } from "../../../../../../hooks/useSearch";

// TODO: Docs!
export const mockFlow: FlowGraph = {
  _root: {
    edges: [
      "X75drmntDB",
      "elSf1BQXnb",
      "7aapI6waUw",
      "6rgnMh94zu",
      "7C4auH5XWg",
      "S6K3DUZWmj",
      "StMBQK1WZo",
      "7eG9iF86xd",
      "uUQq7w7zDy",
      "LXRopYavCQ",
      "9jiJvRYka6",
      "G6L9c8Sllg",
    ],
  },
  X75drmntDB: {
    type: 100,
    data: {
      description: "<p>Peacock</p>",
      fn: "Yak",
      text: "Seahorse",
      notes: "Echidna",
      howMeasured: "<p>Gazelle</p>",
      policyRef: "<p>Rat</p>",
      info: "<p>Octopus</p>",
    },
    edges: ["hg8O46gdWd"],
  },
  hg8O46gdWd: {
    type: 200,
    data: {
      text: "Gorilla",
      description: "Monkey",
    },
  },
  elSf1BQXnb: {
    type: 105,
    data: {
      allRequired: false,
      description: "<p>.</p>",
      text: ".",
      categories: [
        {
          title: "Koala",
          count: 1,
        },
      ],
    },
    edges: ["OiFdZxSWl1"],
  },
  OiFdZxSWl1: {
    data: {
      text: "Duck",
    },
    type: 200,
    edges: ["ZbQLVR2SzL"],
  },
  ZbQLVR2SzL: {
    type: 730,
    data: {
      steps: [
        {
          title: "Hamster",
          description: "Vulture",
          url: "https://www.starfish.gov.uk",
        },
      ],
      title: ".",
      description: "<p>.</p>",
    },
  },
  "7aapI6waUw": {
    type: 145,
    data: {
      title: ".",
      fileTypes: [
        {
          name: "Penguin",
          fn: "Platypus",
          rule: {
            condition: "AlwaysRequired",
          },
          moreInformation: {
            info: "<p>Kangaroo</p>",
            policyRef: "<p>Tiger</p>",
            howMeasured: "<p>Salamander</p>",
          },
        },
      ],
      hideDropZone: false,
    },
  },
  "6rgnMh94zu": {
    type: 150,
    data: {
      units: "Wolverine",
      allowNegatives: false,
    },
  },
  "7C4auH5XWg": {
    type: 800,
    data: {
      fn: ".",
      title: ".",
      description: "<p>.</p>",
      schemaName: "Hedgehog",
      schema: {
        type: "Impala",
        fields: [
          {
            type: "question",
            data: {
              title: "Donkey",
              fn: ".",
              options: [
                {
                  id: "Alpaca",
                  data: {
                    text: "Alpaca",
                    val: "Alpaca",
                  },
                },
              ],
            },
          },
          {
            type: "checklist",
            data: {
              title: "Otter",
              fn: ".",
              options: [
                { id: ".", data: { text: "Iguana", description: "Parrot" } },
                { id: "leaves", data: { text: "Leaves" } },
                { id: "bamboo", data: { text: "Bamboo" } },
                { id: "fruit", data: { text: "Fruit" } },
              ],
            },
          },
        ],
        min: 1,
      },
    },
  },
  S6K3DUZWmj: {
    type: 7,
    data: {
      tasks: [
        {
          title: "Ostrich",
          description: "<p>Beaver</p>",
        },
      ],
      title: ".",
      description: "<p>.</p>",
    },
  },
  StMBQK1WZo: {
    type: 250,
    data: {
      content: "<p>Sheep</p>",
    },
  },
  "7eG9iF86xd": {
    type: 725,
    data: {
      color: {
        text: "#000",
        background: "rgba(1, 99, 96, 0.1)",
      },
      heading: "Snake",
      moreInfo: "<p>Tarantula</p>",
      contactInfo: "<p>Weasel</p>",
      nextSteps: [
        {
          title: "Llama",
          description: "Toucan",
        },
      ],
    },
  },
  uUQq7w7zDy: {
    type: 9,
    data: {
      title: ".",
      allowNewAddresses: true,
      newAddressTitle: "Mouse",
      newAddressDescription: "<p>Stingray</p>",
      newAddressDescriptionLabel: "Scorpion",
    },
  },
  LXRopYavCQ: {
    type: 10,
    data: {
      title: ".",
      description: "<p>.</p>",
      titleForUploading: "Elephant",
      descriptionForUploading: "<p>Panda</p>",
      hideFileUpload: false,
      dataFieldBoundary: "property.boundary.site",
      dataFieldArea: "property.boundary.area",
    },
  },
  "9jiJvRYka6": {
    type: 11,
    data: {
      title: ".",
      description: "<p>.</p>",
      fn: "property.constraints.planning",
      disclaimer: "<p>Barracuda</p>",
    },
  },
  G6L9c8Sllg: {
    type: 400,
    data: {
      title: "Jaguar",
      bannerTitle: "Moose",
      description: "<p>.</p>",
      fn: ".",
      instructionsTitle: "Pelican",
      instructionsDescription: "<p>Cockatoo</p>",
      hidePay: false,
      allowInviteToPay: true,
      secondaryPageTitle: "Chicken",
      nomineeTitle: "Aardvark",
      nomineeDescription: "<p>Cheetah</p>",
      yourDetailsTitle: "Camel",
      yourDetailsDescription: "<p>Macaw</p>",
      yourDetailsLabel: "Skunk",
      govPayMetadata: [
        {
          key: "flow",
          value: "search-all-fields",
        },
        {
          key: "source",
          value: "PlanX",
        },
        {
          key: "paidViaInviteToPay",
          value: "@paidViaInviteToPay",
        },
      ],
    },
  },
};

export const mockQuestionResult: SearchResult<IndexedNode> = {
  item: {
    id: "X75drmntDB",
    parentId: "_root",
    type: 100,
    data: {
      fn: "Yak",
      info: "<p>Octopus</p>",
      text: "Seahorse",
      notes: "Echidna",
      policyRef: "<p>Rat</p>",
      description: "<p>Peacock</p>",
      howMeasured: "<p>Gazelle</p>",
    },
    edges: ["hg8O46gdWd"],
  },
  key: "data.text",
  matchIndices: [[0, 7]],
  refIndex: 0,
};

export const mockPayResult: SearchResult<IndexedNode> = {
  item: {
    id: "G6L9c8Sllg",
    parentId: "_root",
    type: 400,
    data: {
      fn: ".",
      title: "Jaguar",
      hidePay: false,
      bannerTitle: "Moose",
      description: "<p>.</p>",
      nomineeTitle: "Aardvark",
      govPayMetadata: [
        {
          key: "flow",
          value: "search-all-fields",
        },
        {
          key: "source",
          value: "PlanX",
        },
        {
          key: "paidViaInviteToPay",
          value: "@paidViaInviteToPay",
        },
      ],
      allowInviteToPay: true,
      yourDetailsLabel: "Skunk",
      yourDetailsTitle: "Camel",
      instructionsTitle: "Pelican",
      nomineeDescription: "<p>Cheetah</p>",
      secondaryPageTitle: "Chicken",
      yourDetailsDescription: "<p>Macaw</p>",
      instructionsDescription: "<p>Cockatoo</p>",
    },
  },
  key: "data.title",
  matchIndices: [[0, 5]],
  refIndex: 0,
};

export const mockChecklistResult: SearchResult<IndexedNode> = {
  item: {
    id: "elSf1BQXnb",
    parentId: "_root",
    type: 105,
    data: {
      text: ".",
      categories: [
        {
          count: 1,
          title: "Koala",
        },
      ],
      allRequired: false,
      description: "<p>.</p>",
    },
    edges: ["OiFdZxSWl1"],
  },
  key: "data.categories.title",
  matchIndices: [[0, 4]],
  refIndex: 0,
};

export const mockChecklistOptionResult: SearchResult<IndexedNode> = {
  item: {
    id: "OiFdZxSWl1",
    parentId: "elSf1BQXnb",
    type: 200,
    data: {
      text: "Duck",
    },
    edges: ["ZbQLVR2SzL"],
  },
  key: "data.text",
  matchIndices: [[0, 3]],
  refIndex: 0,
};

export const mockNextStepsOptionResult: SearchResult<IndexedNode> = {
  item: {
    id: "ZbQLVR2SzL",
    parentId: "OiFdZxSWl1",
    type: 730,
    data: {
      steps: [
        {
          url: "https://www.starfish.gov.uk",
          title: "Hamster",
          description: "Vulture",
        },
      ],
      title: ".",
      description: "<p>.</p>",
    },
  },
  key: "data.steps.title",
  matchIndices: [[0, 6]],
  refIndex: 0,
};
