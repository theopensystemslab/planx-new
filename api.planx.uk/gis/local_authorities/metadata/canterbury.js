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
    id: "External/Heritage",
    serverIndex: 9,
    fields: ["OBJECTID", "LOCATION_1", "DESCRIPTIO"],
    neg: "is not subject to any Article 4 Restriction",
    pos: (data) => ({
      text: "is subject to Article 4 Restriction(s)",
      description: data.LOCATION_1,
    }),
  },
  listed: {
    key: "listed",
    source: canterburyDomain,
    id: "External/Heritage",
    serverIndex: 6,
    fields: ["OBJECTID", "GRADE", "NAME", "DESCRIPTIO"],
    neg: "is not in, or within, a Listed Building",
    pos: (data) => ({
      text: `is, or is within, a Listed Building Grade ${data.GRADE}`,
      description: data.NAME,
    }),
  },
  "designated.conservationArea": {
    key: "designated.conservationArea",
    source: canterburyDomain,
    id: "Open_Data/Conservation_Areas",
    fields: ["OBJECTID", "NAME", "URL"],
    neg: "is not in a Conservation Area",
    pos: (data) => ({
      text: "is in a Conservation Area",
      description: data.NAME,
    }),
  },
  "designated.AONB": {
    key: "designated.AONB",
    source: environmentDomain,
    id: "NE/AreasOfOutstandingNaturalBeautyEngland",
    fields: ["objectid", "code", "name", "desig_date", "hotlink"],
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
    id: "External/Heritage",
    serverIndex: 1,
    fields: ["OBJECTID", "NAME", "NOTES"],
    neg: "is not an UNESCO World Heritage Site",
    pos: (data) => ({
      text: "is an UNESCO World Heritage Site",
      description: data.NAME,
    }),
  },
  "designated.monument": { value: false },
  tpo: {
    key: "tpo",
    source: canterburyDomain,
    id: "Open_Data/Tree_Preservation_Orders",
    fields: ["OBJECTID", "TPO"],
    neg: "is not in a TPO (Tree Preservation Order) zone",
    pos: (data) => ({
      text: "is in a TPO (Tree Preservation Order) zone",
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
