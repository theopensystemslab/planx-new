import type { Store } from "../store";
import { vanillaStore } from "../store";

const { getState, setState } = vanillaStore;

// https://i.imgur.com/k0kkKox.png

const flow: Store.flow = {
  _root: {
    edges: ["d5SxIWZej9", "LAz2YqYChs", "nroxFPM2Jx"],
  },
  LAz2YqYChs: {
    type: 500,
    data: {
      fn: "flag",
    },
    edges: [
      "IK6gNsf8iF",
      "gOLt5Yd4Fy",
      "wgWEaXVfBt",
      "QKSqXyhvQW",
      "AM6b72H0aV",
      "o3H1U1k6v6",
      "VkqLPBX1mQ",
      "udy3cmVDMh",
    ],
  },
  IK6gNsf8iF: {
    type: 200,
    data: {
      text: "Immune",
      val: "IMMUNE",
    },
    edges: ["TmpbJgjGPH"],
  },
  gOLt5Yd4Fy: {
    type: 200,
    data: {
      text: "Missing information",
      val: "MISSING_INFO",
    },
  },
  wgWEaXVfBt: {
    type: 200,
    data: {
      text: "Permission needed",
      val: "PLANNING_PERMISSION_REQUIRED",
    },
  },
  QKSqXyhvQW: {
    type: 200,
    data: {
      text: "Prior approval",
      val: "PRIOR_APPROVAL",
    },
  },
  AM6b72H0aV: {
    type: 200,
    data: {
      text: "Notice",
      val: "PP-NOTICE",
    },
  },
  o3H1U1k6v6: {
    type: 200,
    data: {
      text: "Permitted development",
      val: "NO_APP_REQUIRED",
    },
  },
  VkqLPBX1mQ: {
    type: 200,
    data: {
      text: "Not development",
      val: "PP-NOT_DEVELOPMENT",
    },
  },
  udy3cmVDMh: {
    type: 200,
    data: {
      text: "(No Result)",
    },
    edges: ["lOrm4XmVGv"],
  },
  d5SxIWZej9: {
    type: 100,
    data: {
      text: "is this project immune?",
    },
    edges: ["FZ1kmhT37j", "ZTZqcDAOoG"],
  },
  FZ1kmhT37j: {
    type: 200,
    data: {
      text: "yes",
      flag: "IMMUNE",
    },
  },
  ZTZqcDAOoG: {
    type: 200,
    data: {
      text: "no",
    },
  },
  TmpbJgjGPH: {
    type: 250,
    data: {
      content: "<p>this project is immune</p>\n",
    },
  },
  lOrm4XmVGv: {
    type: 250,
    data: {
      content: "<p>this project is not immune</p>\n",
    },
  },
  nroxFPM2Jx: {
    type: 250,
    data: {
      content: "<p>last thing</p>\n",
    },
  },
};

test("don't expand filters before visiting them (A)", () => {
  setState({
    flow,
  });

  expect(getState().upcomingCardIds()).toEqual([
    "d5SxIWZej9",
    "LAz2YqYChs",
    "nroxFPM2Jx",
  ]);
});

test("immune path (B)", () => {
  setState({
    flow,
    breadcrumbs: {
      d5SxIWZej9: {
        auto: false,
        answers: ["FZ1kmhT37j"],
      },
    },
  });

  expect(getState().upcomingCardIds()).toEqual(["TmpbJgjGPH", "nroxFPM2Jx"]);
});

test("not immune path (C)", () => {
  setState({
    flow,
    breadcrumbs: {
      d5SxIWZej9: {
        auto: false,
        answers: ["ZTZqcDAOoG"],
      },
    },
  });

  expect(getState().upcomingCardIds()).toEqual(["lOrm4XmVGv", "nroxFPM2Jx"]);
});
