import { FlowGraph, IndexedNode } from "@opensystemslab/planx-core/types";

import { SearchResult } from "../../../../../../hooks/useSearch";

/** Simple flow which contains an example of each component which has unique rules for finding data values and displaying these as search results  */
export const mockFlow: FlowGraph = {
  _root: {
    edges: ["UMJi4q9zud", "Xj4E14wvd6", "zryBH8H7vD", "Flfg7UnuhH"],
  },
  "3W0WyymBuj": {
    data: {
      val: "blue",
      text: "Blue",
    },
    type: 200,
  },
  Flfg7UnuhH: {
    data: {
      title: "This is a FileUploadAndLabel component",
      fileTypes: [
        {
          fn: "floorplan",
          name: "Floorplan",
          rule: {
            condition: "AlwaysRequired",
          },
        },
      ],
      hideDropZone: false,
    },
    type: 145,
  },
  UMJi4q9zud: {
    data: {
      fn: "colour",
      text: "This is a question component",
    },
    type: 100,
    edges: ["th2EEQ03a7", "3W0WyymBuj"],
  },
  Xj4E14wvd6: {
    data: {
      fn: "listRoot",
      title: "This is a list component",
      schema: {
        min: 1,
        type: "Existing residential unit type",
        fields: [
          {
            data: {
              fn: "type",
              title: "What best describes the type of this unit?",
              options: [
                {
                  id: "house",
                  data: {
                    val: "house",
                    text: "House",
                  },
                },
                {
                  id: "flat",
                  data: {
                    val: "flat",
                    text: "Flat, apartment or maisonette",
                  },
                },
                {
                  id: "sheltered",
                  data: {
                    val: "sheltered",
                    text: "Sheltered housing",
                  },
                },
                {
                  id: "studio",
                  data: {
                    val: "studio",
                    text: "Studio or bedsit",
                  },
                },
                {
                  id: "cluster",
                  data: {
                    val: "cluster",
                    text: "Cluster flat",
                  },
                },
                {
                  id: "other",
                  data: {
                    val: "other",
                    text: "Other",
                  },
                },
              ],
            },
            type: "question",
          },
          {
            data: {
              fn: "tenure",
              title: "What best describes the tenure of this unit?",
              options: [
                {
                  id: "MH",
                  data: {
                    val: "MH",
                    text: "Market housing",
                  },
                },
                {
                  id: "SAIR",
                  data: {
                    val: "SAIR",
                    text: "Social, affordable or interim rent",
                  },
                },
                {
                  id: "AHO",
                  data: {
                    val: "AHO",
                    text: "Affordable home ownership",
                  },
                },
                {
                  id: "SH",
                  data: {
                    val: "SH",
                    text: "Starter homes",
                  },
                },
                {
                  id: "selfCustomBuild",
                  data: {
                    val: "selfCustomBuild",
                    text: "Self-build and custom build",
                  },
                },
                {
                  id: "other",
                  data: {
                    val: "other",
                    text: "Other",
                  },
                },
              ],
            },
            type: "question",
          },
          {
            data: {
              fn: "bedrooms",
              title: "How many bedrooms does this unit have?",
              allowNegatives: false,
            },
            type: "number",
          },
          {
            data: {
              fn: "identicalUnits",
              title:
                "How many units of the type described above exist on the site?",
              allowNegatives: false,
            },
            type: "number",
          },
        ],
      },
      schemaName: "Residential units - Existing",
    },
    type: 800,
  },
  th2EEQ03a7: {
    data: {
      val: "red",
      text: "Red",
    },
    type: 200,
  },
  zryBH8H7vD: {
    data: {
      title: "This is a calculate component",
      output: "calculateOutput",
      formula: "formulaOne + formulaTwo",
      defaults: {
        formulaOne: "1",
        formulaTwo: "1",
      },
      formatOutputForAutomations: false,
      samples: {},
    },
    type: 700,
  },
};

export const mockQuestionResult: SearchResult<IndexedNode> = {
  item: {
    id: "UMJi4q9zud",
    parentId: "_root",
    type: 100,
    edges: ["th2EEQ03a7", "3W0WyymBuj"],
    data: {
      fn: "colour",
      text: "This is a question component",
    },
  },
  key: "data.fn",
  matchIndices: [[0, 3]],
  refIndex: 0,
};

export const mockAnswerResult: SearchResult<IndexedNode> = {
  item: {
    id: "th2EEQ03a7",
    parentId: "UMJi4q9zud",
    type: 200,
    data: {
      text: "Red",
      val: "red",
    },
  },
  key: "data.val",
  matchIndices: [[0, 2]],
  refIndex: 0,
};

export const mockListRootResult: SearchResult<IndexedNode> = {
  item: {
    id: "Xj4E14wvd6",
    parentId: "_root",
    type: 800,
    data: {
      fn: "listRoot",
      title: "This is a list component",
      schema: {
        min: 1,
        type: "Tree type",
        fields: [
          {
            data: {
              fn: "species",
              type: "short",
              title: "Species",
            },
            type: "text",
          },
          {
            data: {
              fn: "work",
              type: "short",
              title: "Proposed work",
            },
            type: "text",
          },
          {
            data: {
              fn: "justification",
              type: "short",
              title: "Justification",
            },
            type: "text",
          },
          {
            data: {
              fn: "urgency",
              title: "Urgency",
              options: [
                {
                  id: "low",
                  data: {
                    val: "low",
                    text: "Low",
                  },
                },
                {
                  id: "moderate",
                  data: {
                    val: "moderate",
                    text: "Moderate",
                  },
                },
                {
                  id: "high",
                  data: {
                    val: "high",
                    text: "High",
                  },
                },
                {
                  id: "urgent",
                  data: {
                    val: "urgent",
                    text: "Urgent",
                  },
                },
              ],
            },
            type: "question",
          },
          {
            data: {
              fn: "completionDate",
              title: "Expected completion date",
            },
            type: "date",
          },
          {
            data: {
              fn: "features",
              title: "Where is it? Plot as many as apply",
              mapOptions: {
                basemap: "MapboxSatellite",
                drawMany: true,
                drawType: "Point",
                drawColor: "#66ff00",
              },
            },
            type: "map",
          },
        ],
      },
      schemaName: "Trees",
    },
  },
  key: "data.fn",
  matchIndices: [[0, 7]],
  refIndex: 0,
};

export const mockListDataResult: SearchResult<IndexedNode> = {
  item: {
    id: "Xj4E14wvd6",
    parentId: "_root",
    type: 800,
    data: {
      fn: "listRoot",
      title: "This is a list component",
      schema: {
        min: 1,
        type: "Existing residential unit type",
        fields: [
          {
            data: {
              fn: "type",
              title: "What best describes the type of this unit?",
              options: [
                {
                  id: "house",
                  data: {
                    val: "house",
                    text: "House",
                  },
                },
                {
                  id: "flat",
                  data: {
                    val: "flat",
                    text: "Flat, apartment or maisonette",
                  },
                },
                {
                  id: "sheltered",
                  data: {
                    val: "sheltered",
                    text: "Sheltered housing",
                  },
                },
                {
                  id: "studio",
                  data: {
                    val: "studio",
                    text: "Studio or bedsit",
                  },
                },
                {
                  id: "cluster",
                  data: {
                    val: "cluster",
                    text: "Cluster flat",
                  },
                },
                {
                  id: "other",
                  data: {
                    val: "other",
                    text: "Other",
                  },
                },
              ],
            },
            type: "question",
          },
          {
            data: {
              fn: "tenure",
              title: "What best describes the tenure of this unit?",
              options: [
                {
                  id: "MH",
                  data: {
                    val: "MH",
                    text: "Market housing",
                  },
                },
                {
                  id: "SAIR",
                  data: {
                    val: "SAIR",
                    text: "Social, affordable or interim rent",
                  },
                },
                {
                  id: "AHO",
                  data: {
                    val: "AHO",
                    text: "Affordable home ownership",
                  },
                },
                {
                  id: "SH",
                  data: {
                    val: "SH",
                    text: "Starter homes",
                  },
                },
                {
                  id: "selfCustomBuild",
                  data: {
                    val: "selfCustomBuild",
                    text: "Self-build and custom build",
                  },
                },
                {
                  id: "other",
                  data: {
                    val: "other",
                    text: "Other",
                  },
                },
              ],
            },
            type: "question",
          },
          {
            data: {
              fn: "bedrooms",
              title: "How many bedrooms does this unit have?",
              allowNegatives: false,
            },
            type: "number",
          },
          {
            data: {
              fn: "identicalUnits",
              title:
                "How many units of the type described above exist on the site?",
              allowNegatives: false,
            },
            type: "number",
          },
        ],
      },
      schemaName: "Residential units - Existing",
    },
  },
  key: "data.schema.fields.data.fn",
  matchIndices: [[0, 5]],
  refIndex: 1,
};

export const mockListAnswerResult: SearchResult<IndexedNode> = {
  item: {
    id: "Xj4E14wvd6",
    parentId: "_root",
    type: 800,
    data: {
      fn: "listRoot",
      title: "This is a list component",
      schema: {
        min: 1,
        type: "Existing residential unit type",
        fields: [
          {
            data: {
              fn: "type",
              title: "What best describes the type of this unit?",
              options: [
                {
                  id: "house",
                  data: {
                    val: "house",
                    text: "House",
                  },
                },
                {
                  id: "flat",
                  data: {
                    val: "flat",
                    text: "Flat, apartment or maisonette",
                  },
                },
                {
                  id: "sheltered",
                  data: {
                    val: "sheltered",
                    text: "Sheltered housing",
                  },
                },
                {
                  id: "studio",
                  data: {
                    val: "studio",
                    text: "Studio or bedsit",
                  },
                },
                {
                  id: "cluster",
                  data: {
                    val: "cluster",
                    text: "Cluster flat",
                  },
                },
                {
                  id: "other",
                  data: {
                    val: "other",
                    text: "Other",
                  },
                },
              ],
            },
            type: "question",
          },
          {
            data: {
              fn: "tenure",
              title: "What best describes the tenure of this unit?",
              options: [
                {
                  id: "MH",
                  data: {
                    val: "MH",
                    text: "Market housing",
                  },
                },
                {
                  id: "SAIR",
                  data: {
                    val: "SAIR",
                    text: "Social, affordable or interim rent",
                  },
                },
                {
                  id: "AHO",
                  data: {
                    val: "AHO",
                    text: "Affordable home ownership",
                  },
                },
                {
                  id: "SH",
                  data: {
                    val: "SH",
                    text: "Starter homes",
                  },
                },
                {
                  id: "selfCustomBuild",
                  data: {
                    val: "selfCustomBuild",
                    text: "Self-build and custom build",
                  },
                },
                {
                  id: "other",
                  data: {
                    val: "other",
                    text: "Other",
                  },
                },
              ],
            },
            type: "question",
          },
          {
            data: {
              fn: "bedrooms",
              title: "How many bedrooms does this unit have?",
              allowNegatives: false,
            },
            type: "number",
          },
          {
            data: {
              fn: "identicalUnits",
              title:
                "How many units of the type described above exist on the site?",
              allowNegatives: false,
            },
            type: "number",
          },
        ],
      },
      schemaName: "Residential units - Existing",
    },
  },
  key: "data.schema.fields.data.options.data.val",
  matchIndices: [[0, 14]],
  refIndex: 10,
};

export const mockCalculateRootResult: SearchResult<IndexedNode> = {
  item: {
    id: "zryBH8H7vD",
    parentId: "_root",
    type: 700,
    data: {
      title: "This is a calculate component",
      output: "calculateOutput",
      formula: "formulaOne + formulaTwo",
      defaults: {
        formulaOne: "1",
        formulaTwo: "1",
      },
      formatOutputForAutomations: false,
      samples: {},
    },
  },
  key: "data.output",
  matchIndices: [[0, 14]],
  refIndex: 0,
};

export const mockCalculateFormulaResult: SearchResult<IndexedNode> = {
  item: {
    id: "zryBH8H7vD",
    parentId: "_root",
    type: 700,
    data: {
      title: "This is a calculate component",
      output: "calculateOutput",
      formula: "formulaOne + formulaTwo",
      defaults: {
        formulaOne: "1",
        formulaTwo: "1",
      },
      formatOutputForAutomations: false,
      samples: {},
    },
  },
  key: "formula",
  matchIndices: [[0, 6]],
  refIndex: 1,
};

export const mockFileUploadAndLabelResult: SearchResult<IndexedNode> = {
  item: {
    id: "Flfg7UnuhH",
    parentId: "_root",
    type: 145,
    data: {
      title: "This is a FileUploadAndLabel component",
      fileTypes: [
        {
          fn: "floorplan",
          name: "Floorplan",
          rule: {
            condition: "AlwaysRequired",
          },
        },
      ],
      hideDropZone: false,
    },
  },
  key: "data.fileTypes.fn",
  matchIndices: [[0, 8]],
  refIndex: 0,
};
