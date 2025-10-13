import { Store, useStore } from "../../store";
import { clickContinue, visitedNodes } from "../utils";

const { getState, setState } = useStore;
const { upcomingCardIds, resetPreview } = getState();

beforeEach(() => {
  resetPreview();
});

test("Root nodes are always queued up", () => {
  setState({ flow: flowWithoutPortal });

  expect(upcomingCardIds()).toEqual([
    "StartContent",
    "FruitChecklist",
    "EndNotice",
  ]);
});

test("The children of selected answers are queued up", () => {
  setState({ flow: flowWithoutPortal });

  // Step through first Content node
  expect(upcomingCardIds()?.[0]).toEqual("StartContent");
  clickContinue("StartContent", { auto: false });
  expect(visitedNodes()?.[0]).toEqual("StartContent");

  // Select two of three options in Checklist
  expect(upcomingCardIds()?.[0]).toEqual("FruitChecklist");
  clickContinue("FruitChecklist", {
    answers: ["AppleOption", "BananaOption"],
    auto: false,
  });
  expect(visitedNodes()).toEqual(["StartContent", "FruitChecklist"]);

  // Only nodes on selected branches plus the root have been queued up
  expect(upcomingCardIds()).toEqual([
    "AppleFollowup",
    "BananaFollowup",
    "EndNotice",
  ]);
  expect(upcomingCardIds()).not.toContain("OrangeFollowup");
});

test("Root nodes nested within internal portals are queued up", () => {
  setState({ flow: flowWithInternalPortal });

  expect(upcomingCardIds()).toEqual([
    "StartContent",
    "FruitChecklistInPortal",
    "EndNotice",
  ]);
  expect(upcomingCardIds()).not.toContain("InternalPortal");
});

test("The children of selected answers within an internal portal are queued up", () => {
  setState({ flow: flowWithInternalPortal });

  // Step through first Content node
  expect(upcomingCardIds()?.[0]).toEqual("StartContent");
  clickContinue("StartContent", { auto: false });
  expect(visitedNodes()?.[0]).toEqual("StartContent");

  // Select two of three options in Checklist inside of portal
  expect(upcomingCardIds()?.[0]).toEqual("FruitChecklistInPortal");
  clickContinue("FruitChecklistInPortal", {
    answers: ["AppleOption", "BananaOption"],
    auto: false,
  });
  expect(visitedNodes()).toEqual(["StartContent", "FruitChecklistInPortal"]);

  // Only nodes on selected branches plus the root have been queued up
  expect(upcomingCardIds()).toEqual([
    "AppleFollowup",
    "BananaFollowup",
    "EndNotice",
  ]);
  expect(upcomingCardIds()).not.toContain("OrangeFollowup");

  // Step through followup Contents within portal and navigate back into main flow
  clickContinue("AppleFollowup", { auto: false });
  clickContinue("BananaFollowup", { auto: false });
  expect(upcomingCardIds()?.[0]).toEqual("EndNotice");

  // There should be no remaining upcoming cards after final Notice
  clickContinue("EndNotice", { auto: false });
  expect(upcomingCardIds()).toHaveLength(0);
});

const flowWithoutPortal: Store.Flow = {
  _root: {
    edges: ["StartContent", "FruitChecklist", "EndNotice"],
  },
  BananaOption: {
    data: {
      text: "Banana",
    },
    type: 200,
    edges: ["BananaFollowup"],
  },
  AppleOption: {
    data: {
      text: "Apple",
    },
    type: 200,
    edges: ["AppleFollowup"],
  },
  EndNotice: {
    data: {
      color: "#EFEFEF",
      title: "End of test",
      resetButton: true,
    },
    type: 8,
  },
  FruitChecklist: {
    data: {
      text: "Which fruit do you want to eat?",
      allRequired: false,
    },
    type: 105,
    edges: ["AppleOption", "OrangeOption", "BananaOption"],
  },
  OrangeOption: {
    data: {
      text: "Orange",
    },
    type: 200,
    edges: ["OrangeFollowup"],
  },
  OrangeFollowup: {
    data: {
      content: "<p>Selected orange</p>",
    },
    type: 250,
  },
  StartContent: {
    data: {
      content: "<p>Welcome to this test flow</p>",
    },
    type: 250,
  },
  BananaFollowup: {
    data: {
      content: "<p>Selected banana</p>",
    },
    type: 250,
  },
  AppleFollowup: {
    data: {
      content: "<p>Selected apple</p>",
    },
    type: 250,
  },
};

const flowWithInternalPortal: Store.Flow = {
  _root: {
    edges: ["StartContent", "InternalPortal", "EndNotice"],
  },
  EndNotice: {
    data: {
      color: "#EFEFEF",
      title: "End of test",
      resetButton: true,
    },
    type: 8,
  },
  StartContent: {
    data: {
      content: "<p>Welcome to this test flow</p>",
    },
    type: 250,
  },
  InternalPortal: {
    type: 300,
    data: {
      text: "Folder",
    },
    edges: ["FruitChecklistInPortal"],
  },
  FruitChecklistInPortal: {
    data: {
      text: "Which fruit do you want to eat?",
      allRequired: false,
    },
    type: 105,
    edges: ["AppleOption", "OrangeOption", "BananaOption"],
  },
  AppleOption: {
    data: {
      text: "Apple",
    },
    type: 200,
    edges: ["AppleFollowup"],
  },
  AppleFollowup: {
    data: {
      content: "<p>Selected apple</p>",
    },
    type: 250,
  },
  OrangeOption: {
    data: {
      text: "Orange",
    },
    type: 200,
    edges: ["OrangeFollowup"],
  },
  OrangeFollowup: {
    data: {
      content: "<p>Selected orange</p>",
    },
    type: 250,
  },
  BananaOption: {
    data: {
      text: "Banana",
    },
    type: 200,
    edges: ["BananaFollowup"],
  },
  BananaFollowup: {
    data: {
      content: "<p>Selected banana</p>",
    },
    type: 250,
  },
};
