/*
LAD20CD: E07000067
LAD20NM: Braintree
LAD20NMW:
FID: 239

https://braintree.maps.arcgis.com/home/item.html?id=d9067f55fdbd499e8698e36bc1f6b6c7
https://environment.data.gov.uk/arcgis/rest/services
*/

const braintreeDomain = "https://mapping.braintree.gov.uk/";
const environmentDomain = "https://environment.data.gov.uk";

const planningConstraints = {
  "listed.grade1": {
    key: "listed.grade1",
    source: braintreeDomain,
    id: "Internal_Maps/PlanX",
    serverIndex: 0,
    fields: ["OBJECTID"],
    neg: "is not in, or within, a Listed Building (Grade 1)",
    pos: (data) => ({
      text: "is, or is within, a Listed Building (Grade 1)",
      description: null,
    }),
  },
  "listed.grade2": {
    key: "listed.grade2",
    source: braintreeDomain,
    id: "Internal_Maps/PlanX",
    serverIndex: 1,
    fields: ["OBJECTID"],
    neg: "is not in, or within, a Listed Building (Grade 2)",
    pos: (data) => ({
      text: "is, or is within, a Listed Building (Grade 2)",
      description: null,
    }),
  },
  "listed.grade2star": {
    key: "listed.grade2star",
    source: braintreeDomain,
    id: "Internal_Maps/PlanX",
    serverIndex: 2,
    fields: ["OBJECTID"],
    neg: "is not in, or within, a Listed Building (Grade 2*)",
    pos: (data) => ({
      text: "is, or is within, a Listed Building (Grade 2*)",
      description: null,
    }),
  },
  "designated.conservationArea": {
    key: "designated.conservationArea",
    source: braintreeDomain,
    id: "Internal_Maps/PlanX",
    serverIndex: 3,
    fields: ["OBJECTID", "DESIGNATED"],
    neg: "is not in a Conservation Area",
    pos: (data) => ({
      text: "is in a Conservation Area",
      description: null,
    }),
  },
  "nature.SSSI": {
    key: "nature.SSSI",
    source: braintreeDomain,
    id: "Internal_Maps/PlanX",
    serverIndex: 8,
    fields: ["OBJECTID", "LOCATION"],
    neg: "is not a Site of Special Scientific Interest",
    pos: (data) => ({
      text: "is a Site of Special Scientific Interest",
      description: data.LOCATION,
    }),
  },
  "designated.monument": {
    key: "designated.monument",
    source: braintreeDomain,
    id: "Internal_Maps/PlanX",
    serverIndex: 9,
    fields: ["OBJECTID", "LOCATION"],
    neg: "is not the site of a Scheduled Ancient Monument",
    pos: (data) => ({
      text: "is the site of a Scheduled Ancient Monument",
      description: data.LOCATION,
    }),
  },
  "tpo.tenMeterBuffer": {
    key: "tpo.tenMeterBuffer",
    source: braintreeDomain,
    id: "Internal_Maps/PlanX",
    serverIndex: 4,
    fields: ["OBJECTID"],
    neg: "is not in a TPO (Tree Preservation Order) Zone",
    pos: (data) => ({
      text: "is in a TPO (Tree Preservation Order) Zone",
      description: null,
    }),
  },
  "tpo.areas": {
    key: "tpo.areas",
    source: braintreeDomain,
    id: "Internal_Maps/PlanX",
    serverIndex: 5,
    fields: ["OBJECTID", "AREAS"],
    neg: "is not in a TPO (Tree Preservation Order) Zone",
    pos: (data) => ({
      text: "is in a TPO (Tree Preservation Order) Zone",
      description: null,
    }),
  },
  "tpo.woodland": {
    key: "tpo.woodland",
    source: braintreeDomain,
    id: "Internal_Maps/PlanX",
    serverIndex: 6,
    fields: ["OBJECTID", "SPECIES", "REFERENCE_"],
    neg: "is not in a TPO (Tree Preservation Order) Zone",
    pos: (data) => ({
      text: "is in a TPO (Tree Preservation Order) Zone",
      description: null,
    }),
  },
  "tpo.group": {
    key: "tpo.group",
    source: braintreeDomain,
    id: "Internal_Maps/PlanX",
    serverIndex: 7,
    fields: ["OBJECTID", "GROUPS", "SPECIES"],
    neg: "is not in a TPO (Tree Preservation Order) Zone",
    pos: (data) => ({
      text: "is in a TPO (Tree Preservation Order) Zone",
      description: null,
    }),
  },
  article4: {
    key: "article4",
    source: braintreeDomain,
    id: "Internal_Maps/PlanX",
    serverIndex: 10,
    fields: ["OBJECTID", "INFORMATIO"],
    neg: "is not subject to any Article 4 restrictions",
    pos: (data) => ({
      text: "is subject to Article 4 restriction(s)",
      description: data.INFORMATIO,
    }),
    records: {
      0: "article4.braintree.braintree",
      1: "article4.braintree.silverend",
      2: "article4.braintree.gosfield",
      3: "article4.braintree.middleton",
      4: "article4.braintree.shalford.a",
      5: "article4.braintree.shalford.b",
      6: "article4.braintree.greensteadgreen",
      7: "article4.braintree.stisted.a",
      8: "article4.braintree.stisted.b",
      9: "article4.braintree.stisted.c",
      10: "article4.braintree.stisted.d",
      11: "article4.braintree.coggeshall",
      12: "article4.braintree.ashen",
    },
  },
  "designated.AONB": {
    key: "designated.AONB",
    source: "manual", // there are no AONBs in Braintree
    neg: "is not in an Area of Outstanding Natural Beauty",
  },
  "designated.nationalPark": {
    key: "designated.nationalPark",
    source: "manual", // there are no National Parks in Braintree
    neg: "is not in a National Park",
  },
  "designated.broads": {
    key: "designated.broads",
    source: "manual", // there are no Broads in Braintree
    neg: "is not in a Broad",
  },
  "designated.WHS": {
    key: "designated.WHS",
    source: "manual", // there are no WHS in Braintree
    neg: "is not an UNESCO World Heritage Site",
  },
  "defence.explosives": { value: false },
  "defence.safeguarded": { value: false },
  hazard: { value: false },
};

module.exports = {
  planningConstraints,
};
