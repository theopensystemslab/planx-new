import { formatOps, Graph } from "../index";

describe("Update operations", () => {
  test("Updating a single property of a node", () => {
    const ops = [
      {
        p: ["FW5G3EMBI3", "data", "text"],
        oi: "Which vegetables?",
        od: "Which fruits?",
      },
    ];

    expect(formatOps(flowWithChecklist, ops)).toEqual([
      'Updated Checklist text from "Which fruits?" to "Which vegetables?"',
    ]);
  });

  test("Updating many properties of a node", () => {
    const ops = [
      {
        p: ["FW5G3EMBI3", "data", "fn"],
        oi: "fruit",
      },
      {
        p: ["WDwUTbF7Gq", "data", "val"],
        oi: "berry.blue",
      },
      {
        p: ["xTBfSd1Tjy", "data", "val"],
        oi: "banana",
      },
    ];

    expect(formatOps(flowWithChecklist, ops)).toEqual([
      'Added Checklist fn "fruit"',
      'Added Answer val "berry.blue"',
      'Added Answer val "banana"',
    ]);
  });
});

describe("Insert operations", () => {
  test("Adding a new node to the graph", () => {
    const ops = [
      {
        p: ["_root", "edges", 0],
        li: "ubCTG9OtFw",
      },
      {
        p: ["ubCTG9OtFw"],
        oi: {
          type: 8,
          data: {
            title: "This is a test",
            color: "#c81bcb",
            resetButton: false,
          },
        },
      },
    ];

    expect(formatOps(emptyFlow, ops)).toEqual([
      'Added Notice "This is a test"',
    ]);
  });

  test("Adding a new node and its' children to the graph", () => {
    const ops = [
      {
        p: ["_root", "edges", 0],
        li: "FW5G3EMBI3",
      },
      {
        p: ["FW5G3EMBI3"],
        oi: {
          type: 105,
          data: {
            allRequired: false,
            text: "Which fruits?",
          },
          edges: ["WDwUTbF7Gq", "SO5XbLwSYp", "xTBfSd1Tjy"],
        },
      },
      {
        p: ["WDwUTbF7Gq"],
        oi: {
          data: {
            text: "Blueberry",
          },
          type: 200,
        },
      },
      {
        p: ["SO5XbLwSYp"],
        oi: {
          data: {
            text: "Orange",
          },
          type: 200,
        },
      },
      {
        p: ["xTBfSd1Tjy"],
        oi: {
          data: {
            text: "Banana",
          },
          type: 200,
        },
      },
    ];

    expect(formatOps(emptyFlow, ops)).toEqual([
      'Added Checklist "Which fruits?"',
      'Added Answer "Blueberry"',
      'Added Answer "Orange"',
      'Added Answer "Banana"',
    ]);
  });

  test("Adding a new child to an existing node", () => {
    const ops = [
      {
        p: ["FW5G3EMBI3", "edges"],
        oi: ["WDwUTbF7Gq", "SO5XbLwSYp", "xTBfSd1Tjy", "zzQAMXexRj"],
        od: ["WDwUTbF7Gq", "SO5XbLwSYp", "xTBfSd1Tjy"],
      },
      {
        p: ["zzQAMXexRj"],
        oi: {
          data: {
            text: "Strawberry",
          },
          type: 200,
        },
      },
    ];

    expect(formatOps(flowWithChecklist, ops)).toEqual([
      "Updated order of Checklist edges",
      'Added Answer "Strawberry"',
    ]);
  });

  test("Adding a data property to an existing node that is not in `allowProps`", () => {
    const ops = [
      {
        p: ["FW5G3EMBI3", "data", "description"],
        oi: "<p>Fruits contain seeds and come from the flower of a plant</p>",
      },
    ];

    expect(formatOps(flowWithChecklist, ops)).toEqual([
      "Added Checklist description", // only shows "description", not content
    ]);
  });
});

describe("Remove operations", () => {
  test("Removing a node from the graph", () => {
    const ops = [
      {
        p: ["_root", "edges", 1],
        ld: "FW5G3EMBI3",
      },
      {
        p: ["WDwUTbF7Gq"],
        od: {
          data: {
            text: "Blueberry",
          },
          type: 200,
        },
      },
      {
        p: ["SO5XbLwSYp"],
        od: {
          data: {
            text: "Orange",
          },
          type: 200,
        },
      },
      {
        p: ["xTBfSd1Tjy"],
        od: {
          data: {
            text: "Banana",
          },
          type: 200,
        },
      },
      {
        p: ["FW5G3EMBI3"],
        od: {
          type: 105,
          data: {
            allRequired: false,
            text: "Which fruits?",
          },
          edges: ["wBwRtMce7c", "SO5XbLwSYp", "xTBfSd1Tjy"],
        },
      },
    ];

    expect(formatOps(flowWithChecklist, ops)).toEqual([
      'Removed Answer "Blueberry"',
      'Removed Answer "Orange"',
      'Removed Answer "Banana"',
      'Removed Checklist "Which fruits?"',
    ]);
  });

  test("Removing a child of a node", () => {
    const ops = [
      {
        p: ["FW5G3EMBI3", "edges"],
        oi: ["WDwUTbF7Gq", "xTBfSd1Tjy"],
        od: ["WDwUTbF7Gq", "SO5XbLwSYp", "xTBfSd1Tjy"],
      },
      {
        p: ["SO5XbLwSYp"],
        od: {
          data: {
            text: "Orange",
          },
          type: 200,
        },
      },
    ];

    expect(formatOps(flowWithChecklist, ops)).toEqual([
      "Updated order of Checklist edges",
      'Removed Answer "Orange"',
    ]);
  });

  test.todo("Removing a data property of an existing node");
});

const emptyFlow: Graph = {
  _root: {
    edges: [],
  },
};

const flowWithChecklist: Graph = {
  _root: {
    edges: ["FW5G3EMBI3"],
  },
  FW5G3EMBI3: {
    type: 105,
    data: {
      allRequired: false,
      text: "Which fruits?",
    },
    edges: ["WDwUTbF7Gq", "SO5XbLwSYp", "xTBfSd1Tjy"],
  },
  WDwUTbF7Gq: {
    data: {
      text: "Blueberry",
    },
    type: 200,
  },
  SO5XbLwSYp: {
    data: {
      text: "Orange",
    },
    type: 200,
  },
  xTBfSd1Tjy: {
    data: {
      text: "Banana",
    },
    type: 200,
  },
};
