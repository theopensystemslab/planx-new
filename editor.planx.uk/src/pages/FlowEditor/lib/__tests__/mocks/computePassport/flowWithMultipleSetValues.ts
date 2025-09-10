import { Store } from "pages/FlowEditor/lib/store";

export const flowWithMultipleSetValues: Store.Flow = {
  _root: {
    edges: ["MEi1WhBeua", "3XgE43ozeR", "1uz1zK0H8V", "3rJKnFuJQ4"],
  },
  "1uz1zK0H8V": {
    data: {
      fn: "application.fee.payable",
      tags: [],
      title: "Pay for your application",
      hidePay: false,
      bannerTitle: "The planning fee for this application is",
      description:
        '<p>The planning fee covers the cost of processing your application.    <a target="_self" href="https://www.gov.uk/guidance/fees-for-planning-applications">Find out more about how planning fees are calculated</a> (opens in new tab).</p>',
      nomineeTitle: "Details of the person paying",
      govPayMetadata: [
        {
          key: "flow",
          value: "SetFee passport order",
        },
        {
          key: "source",
          value: "PlanX",
        },
        {
          key: "paidViaInviteToPay",
          value: "@paidViaInviteToPay",
        },
      ],
      allowInviteToPay: false,
      yourDetailsLabel: "Your name or organisation name",
      yourDetailsTitle: "Your details",
      instructionsTitle: "How to pay",
      secondaryPageTitle: "Invite someone else to pay for this application",
      instructionsDescription:
        "<p>You can pay for your application by using GOV.UK Pay.</p>    <p>Your application will be sent after you have paid the fee.     Wait until you see an application sent message before closing your browser.</p>",
    },
    type: 400,
  },
  "3XgE43ozeR": {
    data: {
      fn: "application.fee.payable",
      val: "456",
      operation: "replace",
    },
    type: 380,
  },
  "3rJKnFuJQ4": {
    data: {
      title: "Send",
      destinations: ["email"],
    },
    type: 650,
  },
  MEi1WhBeua: {
    data: {
      fn: "application.fee.payable",
      val: "123",
      tags: [],
      operation: "replace",
    },
    type: 380,
  },
};
