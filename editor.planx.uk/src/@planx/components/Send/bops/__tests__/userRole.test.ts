import { Store } from "pages/FlowEditor/lib/store";

import { USER_ROLES } from "../../model";
import { getBOPSParams } from "..";

// https://i.imgur.com/KhUnUte.png
const flow: Store.flow = {
  _root: {
    edges: ["user_role_question"],
  },
  user_role_question: {
    type: 100,
    data: {
      fn: "user.role",
      text: "user role",
    },
    edges: [
      "applicant_id",
      "agent_id",
      "proxy_id",
      "unsupported_id",
      "other_id",
    ],
  },
  applicant_id: {
    type: 200,
    data: {
      text: "Applicant",
      val: "applicant",
    },
  },
  agent_id: {
    type: 200,
    data: {
      text: "Agent",
      val: "agent",
    },
  },
  proxy_id: {
    type: 200,
    data: {
      text: "Proxy",
      val: "proxy",
    },
  },
  unsupported_id: {
    type: 200,
    data: {
      text: "Unsupported",
      val: "unsupported",
    },
  },
};

// ensure that only supported user.role values are sent to BoPS
// https://github.com/theopensystemslab/planx-new/pull/755

describe("when user.role =", () => {
  [
    ...USER_ROLES.map((role) => ({ passportValue: role, bopsValue: role })),
    { passportValue: "unsupported", bopsValue: undefined },
  ].forEach(({ passportValue, bopsValue }) => {
    const expectedStr = JSON.stringify(bopsValue);

    test(`'${passportValue}', send { user_role: ${expectedStr} } to BoPS`, () => {
      const breadcrumbs = {
        user_role_question: {
          auto: false,
          answers: [`${passportValue}_id`],
        },
      };

      const passport = {
        data: {
          "user.role": [passportValue],
        },
      };

      const result = getBOPSParams({
        breadcrumbs,
        flow,
        passport,
        sessionId: "FAKE-SESSION-ID",
        flowName: "Apply for a lawful development certificate",
      });

      expect(result.user_role).toEqual(bopsValue);
    });
  });
});
