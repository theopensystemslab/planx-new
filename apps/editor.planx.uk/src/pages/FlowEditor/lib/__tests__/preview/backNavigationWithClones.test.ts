import { Store } from "../../store";

// https://editor.planx.uk/app/testing/backwards-navigation
const flow: Store.Flow = {
  _root: {
    edges: ["2ZIGuFTUtP", "TGlsOIuh4O"],
  },
  "2ZIGuFTUtP": {
    data: {
      tags: [],
      text: "What do you want to do?",
      neverAutoAnswer: false,
      alwaysAutoAnswerBlank: false,
    },
    type: 100,
    edges: ["NNgsWrw2b9", "SGp9cmqbee"],
  },
  "71yccDrxOR": {
    data: {
      fn: "proposal.projectType",
      text: "How will the outbuildings be used?",
      allRequired: false,
      neverAutoAnswer: false,
      alwaysAutoAnswerBlank: false,
      tags: [],
    },
    type: 105,
    edges: ["Y4PpSxv4QQ", "Yger8jnqr8"],
  },
  FbbUQsAXnS: {
    data: {
      val: "false",
      text: "Building",
    },
    type: 200,
    edges: ["GPcbvqoYsU"],
  },
  GPcbvqoYsU: {
    data: {
      content:
        "<h1>Cloned folder proxy</h1><p>Is it an incidental residential annexe or a new residential unit?</p><p></p>",
      resetButton: false,
    },
    type: 250,
  },
  Jq48bumSEw: {
    data: {
      text: "Outside the garden of the house",
    },
    type: 200,
  },
  MT3hvMBR61: {
    data: {
      text: "Where will the caravan be sited?",
      neverAutoAnswer: false,
      alwaysAutoAnswerBlank: false,
    },
    type: 100,
    edges: ["zbE3thVeTe", "Jq48bumSEw"],
  },
  NNgsWrw2b9: {
    data: {
      text: "Change how outbuildings are used",
    },
    type: 200,
    edges: ["71yccDrxOR"],
  },
  SGp9cmqbee: {
    data: {
      text: "Site a caravan",
    },
    type: 200,
    edges: ["owsC195jOu", "ZJcX8tNydr"],
  },
  Y4PpSxv4QQ: {
    data: {
      val: "changeOfUse.let.part",
      text: "Long term residence",
    },
    type: 200,
    edges: ["GPcbvqoYsU", "ZJcX8tNydr"],
  },
  Yger8jnqr8: {
    data: {
      val: "changeOfUse.outbuilding",
      text: "Something else",
    },
    type: 200,
  },
  ZJcX8tNydr: {
    data: {
      fn: "proposal.meansOfAccess",
      val: "true",
      operation: "append",
    },
    type: 380,
  },
  ogQZmifptv: {
    data: {
      val: "true",
      text: "Caravan",
    },
    type: 200,
    edges: ["MT3hvMBR61"],
  },
  owsC195jOu: {
    data: {
      fn: "proposal.caravan.building",
      text: "Is it a building or a caravan?",
      neverAutoAnswer: false,
      alwaysAutoAnswerBlank: false,
    },
    type: 100,
    edges: ["FbbUQsAXnS", "ogQZmifptv"],
  },
  zbE3thVeTe: {
    data: {
      text: "Within the garden or driveway",
    },
    type: 200,
    edges: ["GPcbvqoYsU"],
  },
  TGlsOIuh4O: {
    type: 8,
    data: {
      title: "End of test",
      color: "#EFEFEF",
      resetButton: true,
    },
  },
};
