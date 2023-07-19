import {
  ComponentType,
  FlowGraph,
  PaymentRequest,
  SessionData,
} from "@opensystemslab/planx-core/types";
import inviteToPayFlow from "../flows/invite-to-pay-flow";
import { TEST_EMAIL } from "../helpers";

export const mockPaymentRequest: Partial<PaymentRequest> = {
  payeeEmail: "testNominee@opensystemslab.com",
  payeeName: "Mr Nominee",
  sessionPreviewData: {
    _address: {
      title: "123, Test Street, Testville",
    },
    "proposal.projectType": ["alter.decks", "alter.internal.walls"],
  },
  paymentAmount: 12345,
  applicantName: "Mr Agent (Agency Ltd)",
};

export const mockSessionData: Omit<SessionData, "id"> = {
  passport: {
    data: {
      _address: {
        x: 12345,
        y: 54321,
        pao: "1",
        town: "Testville",
        uprn: "000080000000",
        usrn: "00000000",
        title: "123, Test Street, Testville",
        source: "os",
        street: "Test Street",
        latitude: 51.6055791,
        postcode: "SW1 1AA",
        blpu_code: "2",
        longitude: -0.6336819,
        planx_value: "residential.dwelling.house.semiDetached",
        organisation: null,
        planx_description: "Semi-detached",
        single_line_address: "123, Test Street, Testville, East Testshire",
      },
      "property.type": ["residential.dwelling.house.semiDetached"],
      "property.region": ["South East"],
      "proposal.projectType": ["alter.decks", "alter.internal.walls"],
      "applicant.agent.email": "testAgent@opensystemslab.com",
      "application.fee.payable": 123.45,
      "_contact.applicant.agent": {
        "applicant.agent": {
          email: "testAgent@opensystemslab.com",
          phone: "(0123) 456789",
          title: "",
          lastName: "agentLast",
          firstName: "agentFirst",
          organisation: "",
        },
      },
      "applicant.agent.name.last": "agentLast",
      "applicant.agent.name.first": "agentFirst",
      "applicant.agent.phone.primary": "(0123) 456789",
      "property.localAuthorityDistrict": ["South Bucks", "Buckinghamshire"],
    },
  },
  breadcrumbs: {
    "9U4P2rUZnZ": {
      auto: false,
      answers: ["kId6RbgUtl", "IfcqOHdMyi"],
    },
    F9iwWG1jBQ: {
      auto: true,
      data: {
        "application.fee.payable": 123.45,
      },
    },
    X98XqteeDp: {
      auto: false,
      data: {
        _address: {
          x: 12345,
          y: 54321,
          pao: "1",
          town: "Testville",
          uprn: "000080000000",
          usrn: "00000000",
          title: "123, Test Street, Testville",
          source: "os",
          street: "Test Street",
          latitude: 51.6055791,
          postcode: "SW1 1AA",
          blpu_code: "2",
          longitude: -0.6336819,
          planx_value: "residential.dwelling.house.semiDetached",
          organisation: null,
          planx_description: "Semi-detached",
          single_line_address: "123, Test Street, Testville, East Testshire",
        },
        "property.type": ["residential.dwelling.house.semiDetached"],
        "property.region": ["South East"],
        "property.localAuthorityDistrict": ["South Bucks", "Buckinghamshire"],
      },
    },
    yWXG2AYoq2: {
      auto: false,
      data: {
        "applicant.agent.email": "testAgent@opensystemslab.com",
        "_contact.applicant.agent": {
          "applicant.agent": {
            email: "testAgent@opensystemslab.com",
            phone: "(0123) 456789",
            title: "",
            lastName: "agentLast",
            firstName: "agentFirst",
            organisation: "",
          },
        },
        "applicant.agent.name.last": "agentLast",
        "applicant.agent.name.first": "agentFirst",
        "applicant.agent.phone.primary": "(0123) 456789",
      },
    },
  },
};

export const modifiedInviteToPayFlow: FlowGraph = {
  ...inviteToPayFlow,
  "9U4P2rUZnZ": {
    data: {
      fn: "proposal.projectType",
      text: "What is your project type? (CHANGE!)",
      allRequired: false,
    },
    type: ComponentType.Checklist,
    edges: ["kId6RbgUtl", "IfcqOHdMyi", "mgKUfcwq4Z"],
  },
};

export const mockPaymentRequestDetails = {
  applicantName: "Mr Nominee",
  payeeName: "Mrs Agent",
  payeeEmail: TEST_EMAIL,
  sessionPreviewKeys: [["_address", "title"], ["proposal.projectType"]],
};
