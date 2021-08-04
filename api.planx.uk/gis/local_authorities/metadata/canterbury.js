/*
LAD20CD: E07000106
LAD20NM: Canterbury
LAD20NMW:
FID: 285

https://opendata.canterbury.gov.uk/
https://mapping.canterbury.gov.uk/arcgis/rest/services/
https://environment.data.gov.uk/arcgis/rest/services
*/

const canterburyDomain = "https://mapping.canterbury.gov.uk";
const environmentDomain = "https://environment.data.gov.uk";

const planningConstraints = {
  article4: {
    key: "article4",
    source: canterburyDomain,
    id: "External/Planning_Constraints_New",
    serverIndex: 3,
    fields: ["OBJECTID", "REF", "LOCATION_1", "COMMENT", "DESCRIPTIO"],
    neg: "is not subject to any Article 4 Restrictions",
    pos: (data) => ({
      text: "is subject to Article 4 Restriction(s)",
      description: data.LOCATION_1,
    }),
  },
  "article4.canterbury.hmo": {
    key: "article4.canterbury.hmo",
    source: canterburyDomain,
    id: "External/Planning_Constraints_New",
    serverIndex: 6,
    fields: ["OBJECTID", "REF", "LOCATION_1", "COMMENT", "DESCRIPTIO"],
    neg: "is not subject to any Article 4 Restrictions",
    pos: (data) => ({
      text: "is subject to Article 4 Restriction(s)",
      description: data.LOCATION_1,
    }),
  },
  listed: {
    key: "listed",
    source: canterburyDomain,
    id: "External/Planning_Constraints_New",
    serverIndex: 7,
    fields: ["OBJECTID", "GRADE", "NAME", "DESCRIPTIO"],
    neg: "is not in, or within, a Listed Building",
    pos: (data) => ({
      text: `is, or is within, a Listed Building Grade ${data.GRADE}`,
      description: data.NAME,
    }),
  },
  // "Locally listed buildings" do not have a grade; determine if these require more granular planx variable
  "listed.local": {
    key: "listed.local",
    source: canterburyDomain,
    id: "External/Planning_Constraints_New",
    serverIndex: 8,
    fields: ["OBJECTID", "LOCATION", "DESCRIPTIO", "POLICY", "info1"],
    neg: "is not in, or within, a Locally Listed Building",
    pos: (data) => ({
      text: `is, or is within, a Locally Listed Building`,
    }),
  },
  "designated.conservationArea": {
    key: "designated.conservationArea",
    source: canterburyDomain,
    id: "External/Planning_Constraints_New",
    serverIndex: 4,
    fields: ["OBJECTID", "NAME", "TYPE", "DESIGNATIO", "DESCRIPTIO", "URL"],
    neg: "is not in a Conservation Area",
    pos: (data) => ({
      text: "is in a Conservation Area",
      description: data.NAME,
    }),
  },
  "designated.AONB": {
    key: "designated.AONB",
    source: canterburyDomain,
    id: "External/Planning_Constraints_New",
    serverIndex: 2,
    fields: ["OBJECTID", "NAME", "DESIG_DATE", "HOTLINK"],
    neg: "is not an Area of Outstanding Natural Beauty",
    pos: (data) => ({
      text: "is, or is within, an Area of Outstanding Natural Beauty",
      description: data.name,
    }),
  },
  "designated.nationalPark": {
    key: "designated.nationalPark",
    source: "manual", // there are no National Parks in Canterbury
    neg: "is not in a National Park",
  },
  "designated.broads": {
    key: "designated.broads",
    source: "manual", // there are no Broads in Canterbury
    neg: "is not in a Broad",
  },
  "designated.WHS": {
    key: "designated.WHS",
    source: canterburyDomain,
    id: "External/Planning_Constraints_New",
    serverIndex: 13,
    fields: ["OBJECTID", "NAME"],
    neg: "is not an UNESCO World Heritage Site",
    pos: (data) => ({
      text: "is an UNESCO World Heritage Site",
      description: data.NAME,
    }),
  },
  "designated.monument": {
    key: "designated.monument",
    source: canterburyDomain,
    id: "External/Planning_Constraints_New",
    serverIndex: 0,
    fields: ["OBJECTID", "NAME", "SchedDate", "AmendDate"],
    neg: "is not the site of an Ancient Monument",
    pos: (data) => ({
      text: "is the site of an Ancient Monument",
      description: data.NAME,
    }),
  },
  tpo: {
    key: "tpo",
    source: canterburyDomain,
    id: "External/Planning_Constraints_New",
    serverIndex: 13,
    fields: ["OBJECTID", "TPO", "TPO_Group", "Location", "Description"],
    neg: "is not in a TPO (Tree Preservation Order) Zone",
    pos: (data) => ({
      text: "is in a TPO (Tree Preservation Order) Zone",
      description: data,
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
