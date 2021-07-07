import { Store } from "pages/FlowEditor/lib/store";

import { makePayload } from "./bops";

const flow: Store.flow = {
  _root: {
    edges: [
      "LDGBpPGxWC",
      "9K5DHOJIFG",
      "DzIEfGlsGa",
      "JV5ochuXrU",
      "BLGxRowcwn",
      "aKhcyyHYAG",
      "AFoFsXSPus",
    ],
  },
  "9K5DHOJIFG": {
    data: {
      text: "checklist",
      allRequired: false,
    },
    type: 105,
    edges: ["MvzjCmtxMH", "z6NYoKldtb"],
  },
  AFoFsXSPus: {
    data: {
      fn: "text",
      title: "text question",
    },
    type: 110,
  },
  BLGxRowcwn: {
    data: {
      fn: "distance",
      title: "number question",
      units: "miles",
    },
    type: 150,
  },
  DzIEfGlsGa: {
    data: {
      text: "expandable checklist question",
      categories: [
        {
          count: 2,
          title: "Section 1",
        },
        {
          count: 1,
          title: "Section 2",
        },
      ],
      allRequired: false,
    },
    type: 105,
    edges: ["N5m527zxB9", "p57v53iXh4", "JJEclI99HP"],
  },
  JJEclI99HP: {
    data: {
      text: "c3",
    },
    type: 200,
  },
  JV5ochuXrU: {
    data: {
      title: "date question",
    },
    type: 120,
  },
  LDGBpPGxWC: {
    data: {
      fn: "address1",
      title: "address question",
    },
    type: 130,
  },
  MvzjCmtxMH: {
    data: {
      text: "1",
    },
    type: 200,
  },
  N5m527zxB9: {
    data: {
      text: "c1",
    },
    type: 200,
  },
  UvtXroXmvm: {
    data: {
      text: "a2",
    },
    type: 200,
  },
  aKhcyyHYAG: {
    data: {
      text: "regular question",
    },
    type: 100,
    edges: ["mlQrX0WtFc", "UvtXroXmvm"],
  },
  mlQrX0WtFc: {
    data: {
      text: "a1",
    },
    type: 200,
  },
  p57v53iXh4: {
    data: {
      text: "c2",
    },
    type: 200,
  },
  z6NYoKldtb: {
    data: {
      text: "2",
    },
    type: 200,
  },
};

const breadcrumbs: Store.breadcrumbs = {
  LDGBpPGxWC: {
    auto: false,
    data: {
      address1: {
        line1: "line1",
        line2: "line",
        town: "town",
        county: "county",
        postcode: "postcode",
      },
    },
  },
  "9K5DHOJIFG": {
    auto: false,
    answers: ["MvzjCmtxMH", "z6NYoKldtb"],
  },
  DzIEfGlsGa: {
    auto: false,
    answers: ["N5m527zxB9", "p57v53iXh4", "JJEclI99HP"],
  },
  JV5ochuXrU: {
    auto: false,
    data: {
      JV5ochuXrU: "1999-01-01",
    },
  },
  BLGxRowcwn: {
    auto: false,
    data: {
      distance: 500,
    },
  },
  aKhcyyHYAG: {
    auto: false,
    answers: ["mlQrX0WtFc"],
  },
  AFoFsXSPus: {
    auto: false,
    data: {
      text: "testanswer",
    },
  },
};

test("valid node types are serialized correctly for BOPS", () => {
  const expected = [
    {
      question: "address question",
      responses: [{ value: "line1, line, town, county, postcode" }],
    },
    { question: "checklist", responses: [{ value: "1" }, { value: "2" }] },
    {
      question: "expandable checklist question",
      responses: [{ value: "c1" }, { value: "c2" }, { value: "c3" }],
    },
    { question: "date question", responses: [{ value: "1999-01-01" }] },
    { question: "number question", responses: [{ value: "500" }] }, // TODO: use Number(), include unit?
    { question: "regular question", responses: [{ value: "a1" }] },
    { question: "text question", responses: [{ value: "testanswer" }] },
  ];

  const actual = makePayload(flow, breadcrumbs);

  expect(actual).toStrictEqual(expected);
});
