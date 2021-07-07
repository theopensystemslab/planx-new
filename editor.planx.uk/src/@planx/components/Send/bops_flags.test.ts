import { Store } from "pages/FlowEditor/lib/store";

import { getParams } from "./bops";

test("prior", () => {
  const breadcrumbs: Store.breadcrumbs = {
    jkMtyqBwqB: {
      auto: false,
      answers: ["1Y1koNMXwr"],
    },
    Konz0RjOmX: {
      auto: false,
    },
  };
  const passport: Store.passport = {
    data: {},
  };

  const actual = getParams(breadcrumbs, flow, passport, sessionId);

  const expected = {
    application_type: "lawfulness_certificate",
    proposal_details: [
      {
        question: "which answer?",
        responses: [
          {
            metadata: { flags: ["Planning permission / Prior approval"] },
            value: "prior",
          },
        ],
      },
    ],
    result: {
      description: "Custom prior description",
      flag: "Planning permission / Prior approval",
      heading: "Custom prior heading",
    },
    planx_debug_data: {
      breadcrumbs,
      passport,
      session_id: sessionId,
    },
  };

  expect(actual).toStrictEqual(expected);
});

test("permission", () => {
  const breadcrumbs: Store.breadcrumbs = {
    jkMtyqBwqB: {
      auto: false,
      answers: ["pF4ug4nuUT"],
    },
    Konz0RjOmX: {
      auto: false,
    },
    l3JOp21fkV: {
      auto: false,
      data: {
        "application.resultOverride.reason": "i don't agree",
      },
    },
  };
  const passport: Store.passport = {
    data: {
      "application.resultOverride.reason": "i don't agree",
    },
  };

  const actual = getParams(breadcrumbs, flow, passport, sessionId);

  const expected = {
    application_type: "lawfulness_certificate",
    proposal_details: [
      {
        question: "which answer?",
        responses: [
          {
            metadata: { flags: ["Planning permission / Permission needed"] },
            value: "permission",
          },
        ],
      },
      {
        question: "do you want to override this decision?",
        responses: [{ value: "i don't agree" }],
      },
    ],
    result: {
      description: "Planning permission",
      flag: "Planning permission / Permission needed",
      heading: "Permission needed",
      override: "i don't agree",
    },
    planx_debug_data: {
      breadcrumbs,
      passport,
      session_id: sessionId,
    },
  };

  expect(actual).toStrictEqual(expected);
});

test("other", () => {
  const breadcrumbs: Store.breadcrumbs = {
    jkMtyqBwqB: {
      auto: false,
      answers: ["ZpF48YfV5e"],
    },
  };
  const passport: Store.passport = {
    data: {},
  };

  const actual = getParams(breadcrumbs, flow, passport, sessionId);

  const expected = {
    application_type: "lawfulness_certificate",
    proposal_details: [
      { question: "which answer?", responses: [{ value: "other" }] },
    ],
    planx_debug_data: {
      breadcrumbs,
      passport,
      session_id: sessionId,
    },
  };

  expect(actual).toStrictEqual(expected);
});

let flow: Store.flow = {
  _root: {
    edges: ["jkMtyqBwqB"],
  },
  jkMtyqBwqB: {
    type: 100,
    data: {
      text: "which answer?",
    },
    edges: ["1Y1koNMXwr", "pF4ug4nuUT", "ZpF48YfV5e"],
  },
  "1Y1koNMXwr": {
    type: 200,
    data: {
      text: "prior",
      flag: "PRIOR_APPROVAL",
    },
    edges: ["Konz0RjOmX"],
  },
  pF4ug4nuUT: {
    type: 200,
    data: {
      text: "permission",
      flag: "PLANNING_PERMISSION_REQUIRED",
    },
    edges: ["Konz0RjOmX", "l3JOp21fkV"],
  },
  ZpF48YfV5e: {
    type: 200,
    data: {
      text: "other",
    },
  },
  Konz0RjOmX: {
    type: 3,
    data: {
      flagSet: "Planning permission",
      overrides: {
        PRIOR_APPROVAL: {
          heading: "Custom prior heading",
          description: "Custom prior description",
        },
      },
    },
  },
  l3JOp21fkV: {
    type: 110,
    data: {
      title: "do you want to override this decision?",
      fn: "application.resultOverride.reason",
    },
  },
};

const sessionId = "123";
