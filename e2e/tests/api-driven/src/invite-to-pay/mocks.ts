import { ComponentType } from "@opensystemslab/planx-core/types";
import type { FlowGraph, Node } from "@opensystemslab/planx-core/types";

export const mockBreadcrumbs = {
  FindProperty: {
    auto: false,
    data: {
      _address: {
        uprn: "000906319467",
        usrn: "07902881",
        blpu_code: "2",
        latitude: 55.9465751,
        longitude: -3.2042382,
        organisation: null,
        sao: "2F2",
        pao: "16",
        street: "GRINDLAY STREET",
        town: "EDINBURGH",
        postcode: "EH3 9AS",
        x: 324889,
        y: 673270,
        planx_description: "Residential dwelling",
        planx_value: "residential.dwelling",
        single_line_address:
          "2F2, 16, GRINDLAY STREET, OLD TOWN, EDINBURGH, EH3 9AS",
        title: "2F2, 16, GRINDLAY STREET, OLD TOWN",
        source: "os",
      },
      "property.type": ["residential.dwelling"],
    },
  },
  Checklist: {
    auto: false,
    answers: ["ChecklistOptionOne"],
  },
  SetValue: {
    auto: true,
    data: {
      fee: ["42"],
    },
  },
};

export function sendNodeWithDestination(destination): Node {
  return {
    type: ComponentType.Send,
    data: {
      title: "Send",
      destinations: [destination.toLowerCase()],
    },
  };
}

export const inviteToPayFlowGraph: FlowGraph = {
  _root: {
    edges: ["FindProperty", "Checklist", "SetValue", "Pay", "Send"],
  },
  FindProperty: {
    type: ComponentType.FindProperty,
    data: {
      allowNewAddresses: false,
    },
  },
  Checklist: {
    type: ComponentType.Checklist,
    data: {
      allRequired: false,
      fn: "proposal.projectType",
      text: "What do the works involve?",
    },
    edges: ["ChecklistOptionOne", "ChecklistOptionTwo"],
  },
  ChecklistOptionOne: {
    data: {
      text: "Internal alteration",
      val: "alter.internal",
    },
    type: ComponentType.Answer,
  },
  ChecklistOptionTwo: {
    data: {
      text: "New home(s)",
      val: "new.residential.dwelling",
    },
    type: ComponentType.Answer,
  },
  SetValue: {
    type: ComponentType.SetValue,
    data: {
      fn: "fee",
      val: "42",
    },
  },
  Pay: {
    data: {
      fn: "fee",
      title: "Pay for your application",
      bannerTitle: "The planning fee for this application is",
      description:
        "<p>The planning fee covers the cost of processing your application.</p>",
      nomineeTitle: "Details of the person paying",
      allowInviteToPay: true,
      yourDetailsLabel: "Your name or organisation name",
      yourDetailsTitle: "Your details",
      instructionsTitle: "How to pay",
      secondaryPageTitle: "Invite someone else to pay for this application",
      instructionsDescription:
        "<p>You can pay for your application by using GOV.UK Pay.</p>",
    },
    type: ComponentType.Pay,
  },
  Send: {
    type: ComponentType.Send,
    data: {
      title: "Send",
      destinations: ["email"],
    },
  },
};
