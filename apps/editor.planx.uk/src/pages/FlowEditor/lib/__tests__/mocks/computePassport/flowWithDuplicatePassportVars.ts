import { Store } from "pages/FlowEditor/lib/store";

export const flowWithDuplicatePassportVars: Store.Flow = {
  _root: {
    edges: ["4oH6eI9TMm", "CTW66QO1Aq"],
  },
  "4oH6eI9TMm": {
    data: {
      fn: "application.information.sensitive",
      text: "Is any of the information you have provided sensitive?",
    },
    type: 100,
    edges: ["XZlpeuJt9o", "5fh40KCyTJ"],
  },
  "5fh40KCyTJ": {
    data: {
      val: "false",
      text: "No",
    },
    type: 200,
  },
  CTW66QO1Aq: {
    data: {
      color: "#EFEFEF",
      title: "The end",
      resetButton: false,
    },
    type: 8,
  },
  XZlpeuJt9o: {
    data: {
      val: "true",
      text: "Yes",
    },
    type: 200,
    edges: ["sIipiCHueb"],
  },
  sIipiCHueb: {
    data: {
      fn: "application.information.sensitive",
      type: "long",
      title: "What is it about the information that makes it sensitive?",
    },
    type: 110,
  },
};
