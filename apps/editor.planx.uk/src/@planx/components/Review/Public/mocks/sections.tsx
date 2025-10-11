export const flowWithSections = {
  _root: {
    edges: [
      "section1",
      "findProperty",
      "propertyInfo",
      "section2",
      "question1",
      "question2",
      "review",
      "notice",
    ],
  },
  section1: {
    type: 360,
    data: {
      title: "About the property",
    },
  },
  findProperty: {
    type: 9,
    data: {
      allowNewAddresses: false,
    },
  },
  propertyInfo: {
    type: 12,
    data: {
      title: "About the property",
      description:
        "This is the information we currently have about the property",
      showPropertyTypeOverride: false,
    },
  },
  section2: {
    type: 360,
    data: {
      title: "About the project",
    },
  },
  question1: {
    type: 100,
    data: {
      text: "What type of project",
    },
    edges: ["fXmbQnwDib", "HwWVO7nfZn"],
  },
  fXmbQnwDib: {
    type: 200,
    data: {
      text: "Existing",
    },
  },
  HwWVO7nfZn: {
    type: 200,
    data: {
      text: "Proposed",
    },
  },
  question2: {
    type: 100,
    data: {
      text: "Another question",
    },
    edges: ["9tOeeZGuau", "QlnDaI2c7V"],
  },
  "9tOeeZGuau": {
    type: 200,
    data: {
      text: "Yes",
    },
  },
  QlnDaI2c7V: {
    type: 200,
    data: {
      text: "No",
    },
  },
  review: {
    type: 600,
    data: {
      title: "Check your answers before sending your application",
    },
  },
  notice: {
    type: 8,
    data: {
      color: "#EFEFEF",
      resetButton: true,
    },
  },
};

export const breadcrumbsWithSections = {
  section1: {
    auto: false,
  },
  findProperty: {
    auto: false,
    data: {
      _address: {
        uprn: "200000797602",
        blpu_code: "2",
        latitude: 51.6274191,
        longitude: -0.7489513,
        organisation: "BUCKINGHAMSHIRE COUNCIL",
        pao: "",
        street: "QUEEN VICTORIA ROAD",
        town: "HIGH WYCOMBE",
        postcode: "HP11 1BB",
        x: 486694,
        y: 192808,
        planx_description: "Community Service Centre / Office",
        planx_value: "commercial.community.services",
        single_line_address:
          "BUCKINGHAMSHIRE COUNCIL, COUNCIL OFFICES, QUEEN VICTORIA ROAD, HIGH WYCOMBE, BUCKINGHAMSHIRE, HP11 1BB",
        title:
          "BUCKINGHAMSHIRE COUNCIL, COUNCIL OFFICES, QUEEN VICTORIA ROAD, HIGH WYCOMBE",
        source: "os",
      },
      "property.type": ["commercial.community.services"],
      "property.localAuthorityDistrict": ["Wycombe", "Buckinghamshire"],
      "property.region": ["South East"],
    },
  },
  propertyInfo: {
    auto: false,
  },
  section2: {
    auto: false,
  },
  question1: {
    auto: false,
    answers: ["HwWVO7nfZn"],
  },
  question2: {
    auto: false,
    answers: ["QlnDaI2c7V"],
  },
};

export const passportWithSections = {
  data: {
    _address: {
      uprn: "200000797602",
      blpu_code: "2",
      latitude: 51.6274191,
      longitude: -0.7489513,
      organisation: "BUCKINGHAMSHIRE COUNCIL",
      pao: "",
      street: "QUEEN VICTORIA ROAD",
      town: "HIGH WYCOMBE",
      postcode: "HP11 1BB",
      x: 486694,
      y: 192808,
      planx_description: "Community Service Centre / Office",
      planx_value: "commercial.community.services",
      single_line_address:
        "BUCKINGHAMSHIRE COUNCIL, COUNCIL OFFICES, QUEEN VICTORIA ROAD, HIGH WYCOMBE, BUCKINGHAMSHIRE, HP11 1BB",
      title:
        "BUCKINGHAMSHIRE COUNCIL, COUNCIL OFFICES, QUEEN VICTORIA ROAD, HIGH WYCOMBE",
      source: "os",
    },
    "property.type": ["commercial.community.services"],
    "property.localAuthorityDistrict": ["Wycombe", "Buckinghamshire"],
    "property.region": ["South East"],
  },
};
