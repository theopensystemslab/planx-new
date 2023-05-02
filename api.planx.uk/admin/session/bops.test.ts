import supertest from "supertest";
import app from "../../server";
import { authHeader } from "../../tests/mockJWT";
import { queryMock } from "../../tests/graphqlQueryMock";

const endpoint = (strings: TemplateStringsArray) => `/admin/session/${strings[0]}/bops`;

describe("BOPS payload endpoint", () => {
  beforeEach(() => {
    queryMock.mockQuery({
      name: "GetSessionById",
      variables: {
        id: "123",
      },
      data: {
        lowcal_sessions_by_pk: mockSession,
      },
    });

    queryMock.mockQuery({
      name: "GetLatestPublishedFlowData",
      variables: {
        flowId: "456",
      },
      data: {
        published_flows: [
          {
            data: mockFlow,
          },
        ],
      },
    });
  });

  afterEach(() => jest.clearAllMocks());

  it("requires a user to be logged in", async () => {
    await supertest(app)
      .get(endpoint`123`)
      .expect(401)
      .then(res => expect(res.body).toEqual({
        error: "No authorization token was found",
      }));
  });

  it("returns a JSON payload", async () => {
    await supertest(app)
      .get(endpoint`123`)
      .set(authHeader())
      .expect(200)
      .expect("content-type", "application/json; charset=utf-8")
      .then(res => expect(res.body).toEqual(expectedPayload));
  });
});

const expectedPayload = {
  "application_type": "TODO",
  "site": {
    "uprn": "200000797602",
    "address_1": "BUCKINGHAMSHIRE COUNCIL, COUNCIL OFFICES, QUEEN VICTORIA ROAD",
    "town": "HIGH WYCOMBE",
    "postcode": "HP11 1BB",
    "latitude": 51.6274191,
    "longitude": -0.7489513,
    "x": 486694,
    "y": 192808,
    "source": "os"
  },
  "files": [{
    "filename": "http://localhost:7002/file/private/9n1yemif/Screenshot%20from%202023-04-27%2018-23-10.png",
    "tags": ["Proposed", "Elevation"]
  }],
  "proposal_details": [{
    "question": "What's your role",
    "responses": [{
      "value": "Applicant"
    }],
    "metadata": {
      "portal_name": "_root"
    }
  }, {
    "question": "Your contact details",
    "responses": [{
      "value": "jessica@opensystemslab.io Test Test 0123456789"
    }],
    "metadata": {
      "portal_name": "_root"
    }
  }],
  "result": {
    "flag": "Planning permission / No result",
    "heading": "No result",
    "description": ""
  },
  "user_role": "applicant",
  "applicant_first_name": "Test",
  "applicant_last_name": "Test",
  "applicant_phone": "0123456789",
  "applicant_email": "jessica@opensystemslab.io",
  "planx_debug_data": {
    "session_id": "123",
    "breadcrumbs": {
      "ENrGIt0No8": {
        "auto": false,
        "data": {
          "proposal.elevation": [{
            "url": "http://localhost:7002/file/private/9n1yemif/Screenshot%20from%202023-04-27%2018-23-10.png",
            "filename": "Screenshot from 2023-04-27 18-23-10.png",
            "cachedSlot": {
              "id": "Yakp2kl_qAABEfO6ajSfm",
              "url": "http://localhost:7002/file/private/9n1yemif/Screenshot%20from%202023-04-27%2018-23-10.png",
              "file": {
                "path": "Screenshot from 2023-04-27 18-23-10.png",
                "size": 123336,
                "type": "image/png"
              },
              "status": "success",
              "progress": 1
            }
          }]
        }
      },
      "LwaXZEGsoH": {
        "auto": false,
        "data": {
          "_address": {
            "x": 486694,
            "y": 192808,
            "pao": "",
            "town": "HIGH WYCOMBE",
            "uprn": "200000797602",
            "usrn": "45501554",
            "title": "BUCKINGHAMSHIRE COUNCIL, COUNCIL OFFICES, QUEEN VICTORIA ROAD, HIGH WYCOMBE",
            "source": "os",
            "street": "QUEEN VICTORIA ROAD",
            "latitude": 51.6274191,
            "postcode": "HP11 1BB",
            "blpu_code": "2",
            "longitude": -0.7489513,
            "planx_value": "commercial.community.services",
            "organisation": "BUCKINGHAMSHIRE COUNCIL",
            "planx_description": "Community Service Centre / Office",
            "single_line_address": "BUCKINGHAMSHIRE COUNCIL, COUNCIL OFFICES, QUEEN VICTORIA ROAD, HIGH WYCOMBE, BUCKINGHAMSHIRE, HP11 1BB"
          },
          "property.type": ["commercial.community.services"],
          "property.region": ["South East"],
          "property.localAuthorityDistrict": ["Wycombe", "Buckinghamshire"]
        }
      },
      "Mz4ApW4Rtr": {
        "auto": false
      },
      "VWvssepRJE": {
        "auto": false,
        "answers": ["3vnKtiiveY"]
      },
      "ZJEFlrhvLB": {
        "auto": false
      },
      "nhucmh2x42": {
        "auto": false,
        "data": {
          "applicant.email": "jessica@opensystemslab.io",
          "_contact.applicant": {
            "applicant": {
              "email": "jessica@opensystemslab.io",
              "phone": "0123456789",
              "title": "",
              "lastName": "Test",
              "firstName": "Test",
              "organisation": ""
            }
          },
          "applicant.name.last": "Test",
          "applicant.name.first": "Test",
          "applicant.phone.primary": "0123456789"
        }
      }
    },
    "passport": {
      "data": {
        "_address": {
          "x": 486694,
          "y": 192808,
          "pao": "",
          "town": "HIGH WYCOMBE",
          "uprn": "200000797602",
          "usrn": "45501554",
          "title": "BUCKINGHAMSHIRE COUNCIL, COUNCIL OFFICES, QUEEN VICTORIA ROAD, HIGH WYCOMBE",
          "source": "os",
          "street": "QUEEN VICTORIA ROAD",
          "latitude": 51.6274191,
          "postcode": "HP11 1BB",
          "blpu_code": "2",
          "longitude": -0.7489513,
          "planx_value": "commercial.community.services",
          "organisation": "BUCKINGHAMSHIRE COUNCIL",
          "planx_description": "Community Service Centre / Office",
          "single_line_address": "BUCKINGHAMSHIRE COUNCIL, COUNCIL OFFICES, QUEEN VICTORIA ROAD, HIGH WYCOMBE, BUCKINGHAMSHIRE, HP11 1BB"
        },
        "user.role": ["applicant"],
        "property.type": ["commercial.community.services"],
        "applicant.email": "jessica@opensystemslab.io",
        "property.region": ["South East"],
        "_contact.applicant": {
          "applicant": {
            "email": "jessica@opensystemslab.io",
            "phone": "0123456789",
            "title": "",
            "lastName": "Test",
            "firstName": "Test",
            "organisation": ""
          }
        },
        "proposal.elevation": [{
          "url": "http://localhost:7002/file/private/9n1yemif/Screenshot%20from%202023-04-27%2018-23-10.png",
          "filename": "Screenshot from 2023-04-27 18-23-10.png",
          "cachedSlot": {
            "id": "Yakp2kl_qAABEfO6ajSfm",
            "url": "http://localhost:7002/file/private/9n1yemif/Screenshot%20from%202023-04-27%2018-23-10.png",
            "file": {
              "path": "Screenshot from 2023-04-27 18-23-10.png",
              "size": 123336,
              "type": "image/png"
            },
            "status": "success",
            "progress": 1
          }
        }],
        "applicant.name.last": "Test",
        "applicant.name.first": "Test",
        "applicant.phone.primary": "0123456789",
        "property.localAuthorityDistrict": ["Wycombe", "Buckinghamshire"]
      }
    }
  }
};

const mockSession = {
  id: "123",
  flowId: "456",
  data: {
    id: "456",
    passport: {
      "data": {
        "_address": {
          "x": 486694,
          "y": 192808,
          "pao": "",
          "town": "HIGH WYCOMBE",
          "uprn": "200000797602",
          "usrn": "45501554",
          "title": "BUCKINGHAMSHIRE COUNCIL, COUNCIL OFFICES, QUEEN VICTORIA ROAD, HIGH WYCOMBE",
          "source": "os",
          "street": "QUEEN VICTORIA ROAD",
          "latitude": 51.6274191,
          "postcode": "HP11 1BB",
          "blpu_code": "2",
          "longitude": -0.7489513,
          "planx_value": "commercial.community.services",
          "organisation": "BUCKINGHAMSHIRE COUNCIL",
          "planx_description": "Community Service Centre / Office",
          "single_line_address": "BUCKINGHAMSHIRE COUNCIL, COUNCIL OFFICES, QUEEN VICTORIA ROAD, HIGH WYCOMBE, BUCKINGHAMSHIRE, HP11 1BB"
        },
        "user.role": ["applicant"],
        "property.type": ["commercial.community.services"],
        "applicant.email": "jessica@opensystemslab.io",
        "property.region": ["South East"],
        "_contact.applicant": {
          "applicant": {
            "email": "jessica@opensystemslab.io",
            "phone": "0123456789",
            "title": "",
            "lastName": "Test",
            "firstName": "Test",
            "organisation": ""
          }
        },
        "proposal.elevation": [{
          "url": "http://localhost:7002/file/private/9n1yemif/Screenshot%20from%202023-04-27%2018-23-10.png",
          "filename": "Screenshot from 2023-04-27 18-23-10.png",
          "cachedSlot": {
            "id": "Yakp2kl_qAABEfO6ajSfm",
            "url": "http://localhost:7002/file/private/9n1yemif/Screenshot%20from%202023-04-27%2018-23-10.png",
            "file": {
              "path": "Screenshot from 2023-04-27 18-23-10.png",
              "size": 123336,
              "type": "image/png"
            },
            "status": "success",
            "progress": 1
          }
        }],
        "applicant.name.last": "Test",
        "applicant.name.first": "Test",
        "applicant.phone.primary": "0123456789",
        "property.localAuthorityDistrict": ["Wycombe", "Buckinghamshire"]
      }
    },
    breadcrumbs: {
      "ENrGIt0No8": {
        "auto": false,
        "data": {
          "proposal.elevation": [{
            "url": "http://localhost:7002/file/private/9n1yemif/Screenshot%20from%202023-04-27%2018-23-10.png",
            "filename": "Screenshot from 2023-04-27 18-23-10.png",
            "cachedSlot": {
              "id": "Yakp2kl_qAABEfO6ajSfm",
              "url": "http://localhost:7002/file/private/9n1yemif/Screenshot%20from%202023-04-27%2018-23-10.png",
              "file": {
                "path": "Screenshot from 2023-04-27 18-23-10.png",
                "size": 123336,
                "type": "image/png"
              },
              "status": "success",
              "progress": 1
            }
          }]
        }
      },
      "LwaXZEGsoH": {
        "auto": false,
        "data": {
          "_address": {
            "x": 486694,
            "y": 192808,
            "pao": "",
            "town": "HIGH WYCOMBE",
            "uprn": "200000797602",
            "usrn": "45501554",
            "title": "BUCKINGHAMSHIRE COUNCIL, COUNCIL OFFICES, QUEEN VICTORIA ROAD, HIGH WYCOMBE",
            "source": "os",
            "street": "QUEEN VICTORIA ROAD",
            "latitude": 51.6274191,
            "postcode": "HP11 1BB",
            "blpu_code": "2",
            "longitude": -0.7489513,
            "planx_value": "commercial.community.services",
            "organisation": "BUCKINGHAMSHIRE COUNCIL",
            "planx_description": "Community Service Centre / Office",
            "single_line_address": "BUCKINGHAMSHIRE COUNCIL, COUNCIL OFFICES, QUEEN VICTORIA ROAD, HIGH WYCOMBE, BUCKINGHAMSHIRE, HP11 1BB"
          },
          "property.type": ["commercial.community.services"],
          "property.region": ["South East"],
          "property.localAuthorityDistrict": ["Wycombe", "Buckinghamshire"]
        }
      },
      "Mz4ApW4Rtr": {
        "auto": false
      },
      "VWvssepRJE": {
        "auto": false,
        "answers": ["3vnKtiiveY"]
      },
      "ZJEFlrhvLB": {
        "auto": false
      },
      "nhucmh2x42": {
        "auto": false,
        "data": {
          "applicant.email": "jessica@opensystemslab.io",
          "_contact.applicant": {
            "applicant": {
              "email": "jessica@opensystemslab.io",
              "phone": "0123456789",
              "title": "",
              "lastName": "Test",
              "firstName": "Test",
              "organisation": ""
            }
          },
          "applicant.name.last": "Test",
          "applicant.name.first": "Test",
          "applicant.phone.primary": "0123456789"
        },
      },
    },
  },
};

const mockFlow = {
  "_root": {
    "edges": [
      "LwaXZEGsoH",
      "VWvssepRJE",
      "ENrGIt0No8",
      "ZJEFlrhvLB",
      "Mz4ApW4Rtr"
    ]
  },
  "3vnKtiiveY": {
    "data": {
      "val": "applicant",
      "text": "Applicant"
    },
    "type": 200,
    "edges": [
      "nhucmh2x42"
    ]
  },
  "ENrGIt0No8": {
    "data": {
      "fn": "proposal.elevation",
      "color": "#EFEFEF",
      "title": "Upload an elevation plan"
    },
    "type": 140
  },
  "LwaXZEGsoH": {
    "data": {
      "allowNewAddresses": false
    },
    "type": 9
  },
  "Mz4ApW4Rtr": {
    "data": {
      "title": "Send",
      "destinations": [
        "bops"
      ]
    },
    "type": 650
  },
  "VWvssepRJE": {
    "data": {
      "fn": "user.role",
      "text": "What's your role"
    },
    "type": 100,
    "edges": [
      "3vnKtiiveY",
      "lPPqaETNmy",
      "jpAC5U7fBO"
    ]
  },
  "ZJEFlrhvLB": {
    "data": {
      "title": "Check your answers before sending your application"
    },
    "type": 600
  },
  "jpAC5U7fBO": {
    "data": {
      "val": "proxy",
      "text": "Proxy"
    },
    "type": 200,
    "edges": [
      "q8OLQUU6Mw"
    ]
  },
  "lPPqaETNmy": {
    "data": {
      "val": "agent",
      "text": "Agent"
    },
    "type": 200,
    "edges": [
      "q8OLQUU6Mw"
    ]
  },
  "nhucmh2x42": {
    "data": {
      "fn": "applicant",
      "title": "Your contact details"
    },
    "type": 135
  },
  "q8OLQUU6Mw": {
    "data": {
      "fn": "agent",
      "title": "Your contact details"
    },
    "type": 135
  }
};
