import { ComponentType } from "@opensystemslab/planx-core/types";
import type { FlowGraph } from "@opensystemslab/planx-core/types";

const flow: FlowGraph = {
  _root: {
    edges: [
      "9U4P2rUZnZ",
      "X98XqteeDp",
      "yWXG2AYoq2",
      "F9iwWG1jBQ",
      "zYQ1QCkElN",
      "LohvWDYd36",
    ],
  },
  "9U4P2rUZnZ": {
    data: {
      fn: "proposal.projectType",
      text: "What is your project type?",
      allRequired: false,
    },
    type: ComponentType.Checklist,
    edges: ["kId6RbgUtl", "IfcqOHdMyi", "mgKUfcwq4Z"],
  },
  F9iwWG1jBQ: {
    data: {
      output: "application.fee.payable",
      formula: "123.45",
    },
    type: ComponentType.Calculate,
  },
  IfcqOHdMyi: {
    data: {
      val: "alter.internal.walls",
      text: "Alter internal walls",
    },
    type: ComponentType.Answer,
  },
  LohvWDYd36: {
    data: {
      title: "Send",
      destinations: ["email"],
    },
    type: ComponentType.Send,
  },
  X98XqteeDp: {
    data: {
      allowNewAddresses: false,
    },
    type: 9,
  },
  kId6RbgUtl: {
    data: {
      val: "alter.decks",
      text: "Addition or alteration of a deck",
    },
    type: ComponentType.Answer,
  },
  mgKUfcwq4Z: {
    data: {
      val: "extend.porch.side",
      text: "Addition of a side porch",
    },
    type: ComponentType.Answer,
  },
  yWXG2AYoq2: {
    data: {
      fn: "applicant.agent",
      title: "Agent details",
    },
    type: ComponentType.ContactInput,
  },
  zYQ1QCkElN: {
    data: {
      title: "Pay for your application",
      bannerTitle: "The planning fee for this application is",
      description:
        '<p>The planning fee covers the cost of processing your application.         Find out more about how planning fees are calculated          <a href="https://www.gov.uk/guidance/fees-for-planning-applications" target="_self">here</a>.</p>',
      fn: "application.fee.payable",
      instructionsTitle: "How to pay",
      instructionsDescription:
        "<p>You can pay for your application by using GOV.UK Pay.</p>         <p>Your application will be sent after you have paid the fee.          Wait until you see an application sent message before closing your browser.</p>",
      allowInviteToPay: true,
      secondaryPageTitle: "Invite someone else to pay for this application",
      nomineeTitle: "Details of the person paying",
      yourDetailsTitle: "Your details",
      yourDetailsLabel: "Your name or organisation name",
      govPayMetadata: [
        { value: "flow-name", key: "flow" },
        { value: "PlanX", key: "source" },
        { value: true, key: "isInviteToPay" },
      ],
    },
    type: ComponentType.Pay,
  },
};

export default flow;
