import type { PaymentRequest, SessionData } from "@opensystemslab/planx-core/types";

export const mockPaymentRequest: Partial<PaymentRequest> = {
  payeeEmail: "testNominee@opensystemslab.com",
  payeeName: "Mr Nominee",
  sessionPreviewData: {
    "_address": {
      "title": "123, Test Street, Testville"
    },
    "proposal.projectType": [
      "extension",
      "swimmingPool"
    ]
  },
  paymentAmount: 12345,
  applicantName: "Mr Agent (Agency Ltd)",
}

/**
 * What is this??
 */
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
        single_line_address: "123, Test Street, Testville, East Testshire"
      },
      "property.type": [
        "residential.dwelling.house.semiDetached"
      ],
      "property.region": [
        "South East"
      ],
      "proposal.projectType": [
        "extension",
        "swimmingPool"
      ],
      "applicant.agent.email": "testAgent@opensystemslab.com",
      "application.fee.payable": 123.45,
      "_contact.applicant.agent": {
        "applicant.agent": {
          email: "testAgent@opensystemslab.com",
          phone: "(0123) 456789",
          title: "",
          lastName: "agentLast",
          firstName: "agentFirst",
          organisation: ""
        }
      },
      "applicant.agent.name.last": "agentLast",
      "applicant.agent.name.first": "agentFirst",
      "applicant.agent.phone.primary": "(0123) 456789",
      "property.localAuthorityDistrict": [
        "South Bucks",
        "Buckinghamshire"
      ]
    }
  },
  breadcrumbs: {
    "9U4P2rUZnZ": {
      auto: false,
      answers: [
        "kId6RbgUtl",
        "IfcqOHdMyi"
      ]
    },
    F9iwWG1jBQ: {
      auto: true,
      data: {
        "application.fee.payable": 123.45
      }
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
          single_line_address: "123, Test Street, Testville, East Testshire"
        },
        "property.type": [
          "residential.dwelling.house.semiDetached"
        ],
        "property.region": [
          "South East"
        ],
        "property.localAuthorityDistrict": [
          "South Bucks",
          "Buckinghamshire"
        ]
      }
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
            organisation: ""
          }
        },
        "applicant.agent.name.last": "agentLast",
        "applicant.agent.name.first": "agentFirst",
        "applicant.agent.phone.primary": "(0123) 456789"
      }
    }
  }
}