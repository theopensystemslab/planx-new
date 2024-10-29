import { FlowGraph, IndexedNode } from "@opensystemslab/planx-core/types";

import { SearchResult } from "../../../../../../hooks/useSearch";

/**
 * Flow which contains an example of each component which searchable text fields
 * Unique fields are given a distinct value (an animal name)
 * Duplicate required fields have a placeholder value (".") to reduce noise
 */
export const mockFlow: FlowGraph = {
  _root: {
    edges: [
      "X75drmntDB",
      "elSf1BQXnb",
      "7aapI6waUw",
      "7C4auH5XWg",
      "6rgnMh94zu",
      "S6K3DUZWmj",
      "StMBQK1WZo",
      "7eG9iF86xd",
      "uUQq7w7zDy",
      "LXRopYavCQ",
      "9jiJvRYka6",
      "G6L9c8Sllg",
      "gyyVEMm9Yb",
    ],
  },
  "6rgnMh94zu": {
    data: {
      units: "Wolverine",
      allowNegatives: false,
    },
    type: 150,
  },
  "7C4auH5XWg": {
    data: {
      fn: ".",
      tags: [],
      title: ".",
      schema: {
        min: 1,
        type: "Impala",
        fields: [
          {
            data: {
              fn: ".",
              title: "Donkey",
              options: [
                {
                  id: "Alpaca",
                  data: {
                    val: "Alpaca",
                    text: "Alpaca",
                  },
                },
              ],
            },
            type: "question",
          },
          {
            data: {
              fn: ".",
              title: "Otter",
              options: [
                {
                  id: ".",
                  data: {
                    text: "Iguana",
                    description: "Parrot",
                  },
                },
              ],
            },
            type: "checklist",
          },
        ],
      },
      schemaName: "Hedgehog",
      description: "<p>.</p>",
    },
    type: 800,
  },
  "7aapI6waUw": {
    data: {
      title: ".",
      fileTypes: [
        {
          fn: "Platypus",
          name: "Penguin",
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
    type: 145,
  },
  "7eG9iF86xd": {
    data: {
      color: {
        text: "#000",
        background: "rgba(1, 99, 96, 0.1)",
      },
      heading: "Snake",
      moreInfo: "<p>Tarantula</p>",
      nextSteps: [
        {
          title: "Llama",
          description: "Toucan",
        },
      ],
      contactInfo: "<p>Weasel</p>",
    },
    type: 725,
  },
  "9jiJvRYka6": {
    data: {
      fn: "property.constraints.planning",
      title: ".",
      disclaimer: "<p>Barracuda</p>",
      description: "<p>.</p>",
    },
    type: 11,
  },
  G6L9c8Sllg: {
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
        {
          key: "Tapir",
          value: "Okapi",
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
    type: 400,
  },
  LXRopYavCQ: {
    data: {
      title: ".",
      description: "<p>.</p>",
      dataFieldArea: "property.boundary.area",
      hideFileUpload: false,
      dataFieldBoundary: "property.boundary.site",
      titleForUploading: "Elephant",
      descriptionForUploading: "<p>Panda</p>",
    },
    type: 10,
  },
  OiFdZxSWl1: {
    data: {
      text: "Duck",
    },
    type: 200,
    edges: ["ZbQLVR2SzL"],
  },
  S6K3DUZWmj: {
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
    type: 7,
  },
  StMBQK1WZo: {
    data: {
      content: "<p>Sheep</p>",
    },
    type: 250,
  },
  X75drmntDB: {
    data: {
      fn: "Yak",
      info: "<p>Octopus</p>",
      text: "Seahorse",
      notes: "Echidna",
      policyRef: "<p>Rat</p>",
      description: "<p>Peacock</p>",
      howMeasured: "<p>Gazelle</p>",
    },
    type: 100,
    edges: ["hg8O46gdWd"],
  },
  ZbQLVR2SzL: {
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
    type: 730,
  },
  elSf1BQXnb: {
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
    type: 105,
    edges: ["OiFdZxSWl1"],
  },
  gyyVEMm9Yb: {
    data: {
      flagSet: "Planning permission",
      overrides: {
        IMMUNE: {
          heading: "Squid",
          description: "Eagle",
        },
      },
    },
    type: 3,
  },
  hg8O46gdWd: {
    data: {
      text: "Gorilla",
      description: "Monkey",
    },
    type: 200,
  },
  uUQq7w7zDy: {
    data: {
      title: ".",
      newAddressTitle: "Mouse",
      allowNewAddresses: true,
      newAddressDescription: "<p>Stingray</p>",
      newAddressDescriptionLabel: "Scorpion",
    },
    type: 9,
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
  matchValue: "Seahorse",
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
        {
          key: "Tapir",
          value: "Okapi",
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
  refIndex: 3,
  matchValue: "Jaguar",
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
  matchValue: "Koala",
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
  matchValue: "Duck",
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
  matchValue: "Hamster",
};

export const mockFileUploadAndLabelResult: SearchResult<IndexedNode> = {
  item: {
    id: "7aapI6waUw",
    parentId: "_root",
    type: 145,
    data: {
      title: ".",
      fileTypes: [
        {
          fn: "Platypus",
          name: "Penguin",
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
  key: "data.fileTypes.name",
  matchIndices: [[0, 6]],
  refIndex: 0,
  matchValue: "Penguin",
};

export const mockNumberInputResult: SearchResult<IndexedNode> = {
  item: {
    id: "6rgnMh94zu",
    parentId: "_root",
    type: 150,
    data: {
      units: "Wolverine",
      allowNegatives: false,
    },
  },
  key: "data.units",
  matchIndices: [[0, 8]],
  refIndex: 0,
  matchValue: "Wolverine",
};

export const mockSchemaResult: SearchResult<IndexedNode> = {
  item: {
    id: "7C4auH5XWg",
    parentId: "_root",
    type: 800,
    data: {
      fn: ".",
      title: ".",
      schema: {
        min: 1,
        type: "Impala",
        fields: [
          {
            type: "map",
            data: {
              title: "Donkey",
              description: "Alpaca",
              fn: ".",
              mapOptions: {
                basemap: "MapboxSatellite",
                drawType: "Point",
                drawColor: "#66ff00",
                drawMany: true,
              },
            },
          },
          {
            data: {
              fn: ".",
              title: "Otter",
              options: [
                {
                  id: ".",
                  data: {
                    text: "Iguana",
                    description: "Parrot",
                  },
                },
              ],
            },
            type: "checklist",
          },
        ],
      },
      schemaName: "Hedgehog",
      description: "<p>.</p>",
    },
  },
  key: "data.schemaName",
  matchIndices: [[0, 7]],
  refIndex: 0,
  matchValue: "Hedgehog",
};

export const mockTaskListResult: SearchResult<IndexedNode> = {
  item: {
    id: "S6K3DUZWmj",
    parentId: "_root",
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
  key: "data.tasks.title",
  matchIndices: [[0, 6]],
  refIndex: 0,
  matchValue: "Ostrich",
};

export const mockContentResult: SearchResult<IndexedNode> = {
  item: {
    id: "StMBQK1WZo",
    parentId: "_root",
    type: 250,
    data: {
      content: "<p>Sheep</p>",
    },
  },
  key: "data.content",
  matchIndices: [[3, 7]],
  refIndex: 0,
  matchValue: "Sheep",
};

export const mockConfirmationResult: SearchResult<IndexedNode> = {
  item: {
    id: "7eG9iF86xd",
    parentId: "_root",
    type: 725,
    data: {
      color: {
        text: "#000",
        background: "rgba(1, 99, 96, 0.1)",
      },
      heading: "Snake",
      moreInfo: "<p>Tarantula</p>",
      nextSteps: [
        {
          title: "Llama",
          description: "Toucan",
        },
      ],
      contactInfo: "<p>Weasel</p>",
    },
  },
  key: "data.heading",
  matchIndices: [[0, 4]],
  refIndex: 0,
  matchValue: "Snake",
};

export const mockFindPropertyResult: SearchResult<IndexedNode> = {
  item: {
    id: "uUQq7w7zDy",
    parentId: "_root",
    type: 9,
    data: {
      title: ".",
      newAddressTitle: "Mouse",
      allowNewAddresses: true,
      newAddressDescription: "<p>Stingray</p>",
      newAddressDescriptionLabel: "Scorpion",
    },
  },
  key: "data.newAddressTitle",
  matchIndices: [[0, 4]],
  refIndex: 0,
  matchValue: "Mouse",
};

export const mockDrawBoundaryResult: SearchResult<IndexedNode> = {
  item: {
    id: "LXRopYavCQ",
    parentId: "_root",
    type: 10,
    data: {
      title: ".",
      description: "<p>.</p>",
      dataFieldArea: "property.boundary.area",
      hideFileUpload: false,
      dataFieldBoundary: "property.boundary.site",
      titleForUploading: "Elephant",
      descriptionForUploading: "<p>Panda</p>",
    },
  },
  key: "data.titleForUploading",
  matchIndices: [[0, 7]],
  refIndex: 0,
  matchValue: "Elephant",
};

export const mockPlanningConstraintsResult: SearchResult<IndexedNode> = {
  item: {
    id: "9jiJvRYka6",
    parentId: "_root",
    type: 11,
    data: {
      fn: "property.constraints.planning",
      title: ".",
      disclaimer: "<p>Barracuda</p>",
      description: "<p>.</p>",
    },
  },
  key: "data.disclaimer",
  matchIndices: [[3, 11]],
  refIndex: 0,
  matchValue: "Barracuda",
};

export const mockResultResult: SearchResult<IndexedNode> = {
  item: {
    id: "gyyVEMm9Yb",
    parentId: "_root",
    type: 3,
    data: {
      flagSet: "Planning permission",
      overrides: {
        IMMUNE: {
          heading: "Squid",
          description: "Eagle",
        },
      },
    },
  },
  key: "data.overrides.IMMUNE.heading",
  matchIndices: [[0, 4]],
  refIndex: 0,
  matchValue: "Squid",
};
