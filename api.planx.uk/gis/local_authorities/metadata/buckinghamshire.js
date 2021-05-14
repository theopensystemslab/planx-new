/*
LAD20CD: E06000060
LAD20NM: Buckinghamshire
LAD20NMW:
FID: 135

https://maps.buckscc.gov.uk/arcgis/rest/services/PLANNING/RIPA_BOPS/MapServer/
https://environment.data.gov.uk/arcgis/rest/services
https://inspire.wycombe.gov.uk/ (legacy)
*/

const bucksDomain = "https://maps.buckscc.gov.uk";
const environmentDomain = "https://environment.data.gov.uk";

const planningConstraints = {
  article4: {
    key: "article4",
    source: bucksDomain,
    id: "PLANNING/RIPA_BOPS",
    serverIndex: 7, // TODO expand beyond Wycombe
    fields: ["OBJECTID", "SUMMARY", "SUMMARY0", "CODE"],
    neg: "is not subject to any Article 4 Restriction",
    pos: (data) => ({
      text: "is subject to Article 4 Restriction(s)",
      description: data.SUMMARY,
    }),
  },
  listed: {
    key: "listed",
    source: bucksDomain,
    id: "PLANNING/RIPA_BOPS",
    serverIndex: 1,
    fields: ["OBJECTID", "GRADE", "DESCRIPTIO", "ADDRESS"],
    neg: "is not in, or within, a Listed Building",
    pos: (data) => ({
      text: `is, or is within, a Listed Building Grade ${data.GRADE}`,
      description: data.DESCRIPTIO,
    }),
  },
  "designated.conservationArea": {
    key: "designated.conservationArea",
    source: bucksDomain,
    id: "PLANNING/RIPA_BOPS",
    serverIndex: 0,
    fields: ["OBJECTID", "Name", "Desc_", "Grade"],
    neg: "is not in a Conservation Area",
    pos: (data) => ({
      text: "is in a Conservation Area",
      description: data.Name,
    }),
  },
  "designated.AONB": {
    key: "designated.AONB",
    source: bucksDomain,
    id: "PLANNING/RIPA_BOPS",
    serverIndex: 3,
    fields: ["OBJECTID", "NAME", "DESCRIPTIO"],
    neg: "is not an Area of Outstanding Natural Beauty",
    pos: (data) => ({
      text: "is, or is within, an Area of Outstanding Natural Beauty",
      description: data.NAME,
    }),
  },
  "designated.nationalPark": {
    key: "designated.nationalPark",
    source: environmentDomain,
    id: "NE/NationalParksEngland",
    fields: ["objectid", "code", "name", "status", "hotlink"],
    neg: "is not a National Park",
    pos: (data) => ({
      text: "is, or is within, a National Park",
      description: data.name,
    }),
  },
  "designated.broads": { value: false },
  "designated.WHS": {
    value: false,
    type: "locally verified",
  },
  "designated.monument": {
    key: "designated.monument",
    source: bucksDomain,
    id: "PLANNING/RIPA_BOPS",
    serverIndex: 2,
    fields: ["OBJECTID", "Name", "Desc_"],
    neg: "is not the site of a Scheduled Ancient Monument",
    pos: (data) => ({
      text: "is the site of a Scheduled Ancient Monument",
      description: data.Name,
    }),
  },
  tpo: {
    key: "tpo",
    source: bucksDomain,
    id: "PLANNING/RIPA_BOPS",
    serverIndex: 11, // TODO expand beyond Wycombe
    fields: ["OBJECTID", "ORDERREF", "STATUS", "COMMENTS"],
    neg: "is not in a TPO (Tree Preservation Order) zone",
    pos: (data) => ({
      text: "is in a TPO (Tree Preservation Order) zone",
      description: data.ORDERREF,
    }),
  },
  "nature.SSSI": {
    key: "nature.SSSI",
    source: environmentDomain,
    id: "NE/SitesOfSpecialScientificInterestEngland",
    fields: ["objectid", "sssi_name"],
    neg: "is not a Site of Special Scientific Interest",
    pos: (data) => ({
      text: "is a Site of Special Scientific Interest",
      description: data.sssi_name,
    }),
  },
  "defence.explosives": { value: false },
  "defence.safeguarded": { value: false },
  hazard: { value: false },
};

module.exports = {
  planningConstraints,
};
