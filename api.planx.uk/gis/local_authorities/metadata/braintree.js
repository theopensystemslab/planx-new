/*
LAD20CD: E07000067
LAD20NM: Braintree
LAD20NMW:
FID: 239

https://mapping.braintree.gov.uk/arcgis/rest/services/PlanX/PlanX/FeatureServer
https://environment.data.gov.uk/arcgis/rest/services
*/

const braintreeDomain = "https://mapping.braintree.gov.uk/arcgis";
const environmentDomain = "https://environment.data.gov.uk";
const A4_KEY = "PARISH";

const planningConstraints = {
  "listed.grade1": {
    key: "listed.grade1",
    source: braintreeDomain,
    id: "PlanX/PlanX",
    serverIndex: 0,
    fields: ["OBJECTID"],
    neg: "is not in, or within, a Listed Building",
    pos: (data) => ({
      text: "is, or is within, a Listed Building (Grade 1)",
      description: null,
    }),
    category: "Heritage and conservation",
  },
  "listed.grade2": {
    key: "listed.grade2",
    source: braintreeDomain,
    id: "PlanX/PlanX",
    serverIndex: 1,
    fields: ["OBJECTID"],
    neg: "is not in, or within, a Listed Building",
    pos: (data) => ({
      text: "is, or is within, a Listed Building (Grade 2)",
      description: null,
    }),
    category: "Heritage and conservation",
  },
  "listed.grade2star": {
    key: "listed.grade2star",
    source: braintreeDomain,
    id: "PlanX/PlanX",
    serverIndex: 2,
    fields: ["OBJECTID"],
    neg: "is not in, or within, a Listed Building",
    pos: (data) => ({
      text: "is, or is within, a Listed Building (Grade 2*)",
      description: null,
    }),
    category: "Heritage and conservation",
  },
  "designated.conservationArea": {
    key: "designated.conservationArea",
    source: braintreeDomain,
    id: "PlanX/PlanX",
    serverIndex: 3,
    fields: ["OBJECTID", "DESIGNATED"],
    neg: "is not in a Conservation Area",
    pos: (data) => ({
      text: "is in a Conservation Area",
      description: null,
    }),
    category: "Heritage and conservation",
  },
  "nature.SSSI": {
    key: "nature.SSSI",
    source: braintreeDomain,
    id: "PlanX/PlanX",
    serverIndex: 8,
    fields: ["OBJECTID", "LOCATION"],
    neg: "is not a Site of Special Scientific Interest",
    pos: (data) => ({
      text: "is a Site of Special Scientific Interest",
      description: data.LOCATION,
    }),
    category: "Ecology",
  },
  monument: {
    key: "monument",
    source: braintreeDomain,
    id: "PlanX/PlanX",
    serverIndex: 9,
    fields: ["OBJECTID", "LOCATION"],
    neg: "is not the site of a Scheduled Ancient Monument",
    pos: (data) => ({
      text: "is the site of a Scheduled Ancient Monument",
      description: data.LOCATION,
    }),
    category: "Heritage and conservation",
  },
  "tpo.tenMeterBuffer": {
    key: "tpo.tenMeterBuffer",
    source: braintreeDomain,
    id: "PlanX/PlanX",
    serverIndex: 4,
    fields: ["OBJECTID"],
    neg: "is not in a TPO (Tree Preservation Order) Zone",
    pos: (data) => ({
      text: "is in a TPO (Tree Preservation Order) Zone",
      description: null,
    }),
    category: "Trees",
  },
  "tpo.areas": {
    key: "tpo.areas",
    source: braintreeDomain,
    id: "PlanX/PlanX",
    serverIndex: 5,
    fields: ["OBJECTID", "AREAS"],
    neg: "is not in a TPO (Tree Preservation Order) Zone",
    pos: (data) => ({
      text: "is in a TPO (Tree Preservation Order) Zone",
      description: null,
    }),
    category: "Trees",
  },
  "tpo.woodland": {
    key: "tpo.woodland",
    source: braintreeDomain,
    id: "PlanX/PlanX",
    serverIndex: 6,
    fields: ["OBJECTID", "SPECIES", "REFERENCE_"],
    neg: "is not in a TPO (Tree Preservation Order) Zone",
    pos: (data) => ({
      text: "is in a TPO (Tree Preservation Order) Zone",
      description: null,
    }),
    category: "Trees",
  },
  "tpo.group": {
    key: "tpo.group",
    source: braintreeDomain,
    id: "PlanX/PlanX",
    serverIndex: 7,
    fields: ["OBJECTID", "GROUPS", "SPECIES"],
    neg: "is not in a TPO (Tree Preservation Order) Zone",
    pos: (data) => ({
      text: "is in a TPO (Tree Preservation Order) Zone",
      description: null,
    }),
    category: "Trees",
  },
  article4: {
    key: "article4",
    source: braintreeDomain,
    id: "PlanX/PlanX",
    serverIndex: 10,
    fields: ["OBJECTID", "PARISH", "INFORMATIO"],
    neg: "is not subject to local permitted development restrictions (known as Article 4 directions)",
    pos: (data) => ({
      text: "is subject to local permitted development restrictions (known as Article 4 directions)",
      description: data.INFORMATIO,
    }),
    records: {
      // planx value to "PARISH" lookup
      "article4.braintree.silverEnd": ["Silver End"],
      "article4.braintree.stisted": [
        "Stisted",
        "Braintree",
        "Gosfield",
        "Middleton",
        "Shalford",
        "Greenstead Green",
        "Coggeshall",
        "Ashen",
      ],
    },
    category: "General policy",
  },
  "designated.AONB": {
    key: "designated.AONB",
    source: "manual", // there are no AONBs in Braintree
    neg: "is not in an Area of Outstanding Natural Beauty",
    category: "Heritage and conservation",
  },
  "designated.nationalPark": {
    key: "designated.nationalPark",
    source: "manual", // there are no National Parks in Braintree
    neg: "is not in a National Park",
    category: "Heritage and conservation",
  },
  "designated.broads": {
    key: "designated.broads",
    source: "manual", // there are no Broads in Braintree
    neg: "is not in a Broad",
    category: "Heritage and conservation",
  },
  "designated.WHS": {
    key: "designated.WHS",
    source: "manual", // there are no WHS in Braintree
    neg: "is not an UNESCO World Heritage Site",
    category: "Heritage and conservation",
  },
  "defence.explosives": { value: false },
  "defence.safeguarded": { value: false },
  hazard: { value: false },
};

export { planningConstraints, A4_KEY };
