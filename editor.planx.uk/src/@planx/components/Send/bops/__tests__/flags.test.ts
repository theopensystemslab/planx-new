import { Store } from "pages/FlowEditor/lib/store";

import { getBOPSParams } from "..";

// PlanX ALWAYS sends a flag result & optional override description (test 2)
// to BOPS, even if (1) no flag result component is shown to the applicant,
// or (3) no flag is collected during the flow.

test("sends flag result despite no result component", () => {
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
  const flowName = "Apply for a lawful development certificate";

  const actual = getBOPSParams({
    breadcrumbs,
    flow,
    passport,
    sessionId,
    flowName,
  });

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
        metadata: { portal_name: "_root" },
      },
    ],
    result: {
      description:
        "It looks like the proposed changes do not require planning permission, however the applicant must apply for Prior Approval before proceeding.",
      flag: "Planning permission / Prior approval",
      heading: "Prior approval",
    },
    planx_debug_data: {
      breadcrumbs,
      passport,
      session_id: sessionId,
    },
  };

  expect(actual).toStrictEqual(expected);
});

test("sends override description with flag result", () => {
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
  const flowName = "Apply for a lawful development certificate";

  const actual = getBOPSParams({
    breadcrumbs,
    flow,
    passport,
    sessionId,
    flowName,
  });

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
        metadata: { portal_name: "_root" },
      },
      {
        question: "do you want to override this decision?",
        responses: [{ value: "i don't agree" }],
        metadata: { portal_name: "_root" },
      },
    ],
    result: {
      description:
        "It looks like the proposed changes may require planning permission.",
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

test("sends 'no result' to BOPS when there is no collected flag", () => {
  const breadcrumbs: Store.breadcrumbs = {
    jkMtyqBwqB: {
      auto: false,
      answers: ["ZpF48YfV5e"],
    },
  };
  const passport: Store.passport = {
    data: {},
  };
  const flowName = "Apply for a lawful development certificate";

  const actual = getBOPSParams({
    breadcrumbs,
    flow,
    passport,
    sessionId,
    flowName,
  });

  const expected = {
    application_type: "lawfulness_certificate",
    proposal_details: [
      {
        question: "which answer?",
        responses: [{ value: "other" }],
        metadata: { portal_name: "_root" },
      },
    ],
    result: {
      description: "",
      flag: "Planning permission / No result",
      heading: "No result",
    },
    planx_debug_data: {
      breadcrumbs,
      passport,
      session_id: sessionId,
    },
  };

  expect(actual).toStrictEqual(expected);
});

// https://i.imgur.com/Mx5UP6t.png
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
