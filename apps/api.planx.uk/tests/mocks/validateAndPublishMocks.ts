import type { FlowGraph } from "@opensystemslab/planx-core/types";

export const mockFlowData: FlowGraph = {
  _root: {
    edges: [
      "SectionOne",
      "FindPropertyNode",
      "QuestionOne",
      "InternalPortalNode",
      "ResultNode",
      "SendNode",
      "ConfirmationNode",
    ],
  },
  SectionOne: {
    type: 360,
    data: {
      title: "Section 1",
    },
  },
  FindPropertyNode: {
    type: 9,
  },
  ResultNode: {
    data: {
      flagSet: "Planning permission",
      overrides: {
        "flag.pp.permittedDevelopment": {
          heading: "Congratulations!",
        },
      },
    },
    type: 3,
  },
  AnswerOne: {
    data: {
      text: "?",
    },
    type: 200,
  },
  QuestionInPortal: {
    data: {
      text: "internal question",
    },
    type: 100,
    edges: ["AnswerInPortalOne", "AnswerInPortalTwo"],
  },
  AnswerTwo: {
    data: {
      text: "!!",
    },
    type: 200,
  },
  InternalPortalNode: {
    data: {
      text: "portal",
    },
    type: 300,
    edges: ["QuestionInPortal"],
  },
  QuestionOne: {
    data: {
      text: "Question",
    },
    type: 100,
    edges: ["AnswerOne", "AnswerTwo"],
  },
  AnswerInPortalOne: {
    data: {
      text: "?",
    },
    type: 200,
  },
  AnswerInPortalTwo: {
    data: {
      text: "*",
    },
    type: 200,
  },
  ConfirmationNode: {
    data: {
      heading: "Form sent",
      moreInfo:
        "<h2>You will be contacted</h2>\n<ul>\n<li>if there is anything missing from the information you have provided so far</li>\n<li>if any additional information is required</li>\n<li>to arrange a site visit, if required</li>\n<li>to inform you whether a certificate has been granted or not</li>\n</ul>\n",
      contactInfo:
        '<p>You can contact us at <a href="mailto:planning@lambeth.gov.uk" target="_self"><strong>planning@lambeth.gov.uk</strong></a></p>\n',
      description:
        "A payment receipt has been emailed to you. You will also receive an email to confirm when your form has been received.",
      feedbackCTA: "What did you think of this service? (takes 30 seconds)",
    },
    type: 725,
  },
  SendNode: {
    data: {
      url: "http://localhost:7002/bops/southwark",
    },
    type: 650,
  },
};

export const draftParentFlow: FlowGraph = {
  _root: {
    edges: ["ContentNode", "ExternalPortalNode", "NoticeNode"],
  },
  ContentNode: {
    type: 250,
    data: {
      content: "<p>This is a test flow with external portal content</p>",
    },
  },
  NoticeNode: {
    type: 8,
    data: {
      title: "End of test",
      color: "#EFEFEF",
      resetButton: true,
    },
  },
  ExternalPortalNode: {
    type: 310,
    data: {
      flowId: "child-flow-id",
    },
  },
};

export const flattenedParentFlow: FlowGraph = {
  _root: {
    edges: ["ContentNode", "ExternalPortalNode", "NoticeNode"],
  },
  ContentNode: {
    data: {
      content: "<p>This is a test flow with external portal content</p>",
    },
    type: 250,
  },
  NoticeNode: {
    data: {
      color: "#EFEFEF",
      title: "End of test",
      resetButton: true,
    },
    type: 8,
  },
  ExternalPortalNode: {
    type: 300,
    edges: ["child-flow-id"],
    data: {
      flattenedFromExternalPortal: true,
    },
  },
  "child-flow-id": {
    edges: ["QuestionInsidePortal"],
    type: 300,
    data: {
      text: "testing/child-flow",
      flattenedFromExternalPortal: true,
    },
  },
  OptionB: {
    data: {
      text: "B",
    },
    type: 200,
  },
  OptionC: {
    data: {
      text: "C",
    },
    type: 200,
  },
  QuestionInsidePortal: {
    data: {
      text: "This is a question in a flow referenced as an external portal",
    },
    type: 100,
    edges: ["OptionA", "OptionB", "OptionC"],
  },
  OptionA: {
    data: {
      text: "A",
    },
    type: 200,
  },
};

export const childFlow: FlowGraph = {
  _root: {
    edges: ["QuestionInsidePortal"],
  },
  OptionB: {
    data: {
      text: "B",
    },
    type: 200,
  },
  OptionC: {
    data: {
      text: "C",
    },
    type: 200,
  },
  QuestionInsidePortal: {
    data: {
      text: "This is a question in a flow referenced as an external portal",
    },
    type: 100,
    edges: ["OptionA", "OptionB", "OptionC"],
  },
  OptionA: {
    data: {
      text: "A",
    },
    type: 200,
  },
};
