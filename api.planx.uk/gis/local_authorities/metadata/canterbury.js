/*
LAD20CD: E07000106
LAD20NM: Canterbury
LAD20NMW:
FID: 285

https://opendata.canterbury.gov.uk/
https://mapping.canterbury.gov.uk/arcgis/rest/services/
*/

const mapServerDomain = "https://mapping.canterbury.gov.uk";

const planningConstraints = {
  "designated.conservationArea": {
    key: "designated.conservationArea",
    id: "Open_Data/Conservation_Areas",
    serverIndex: 0,
    fields: ["OBJECTID", "NAME", "URL"],
    neg: "is not in a Conservation Area",
    pos: (data) => ({
      text: "is in a Conservation Area",
      description: data.NAME,
    }),
  },
  tpo: {
    key: "tpo",
    id: "Open_Data/Tree_Preservation_Orders",
    serverIndex: 0,
    fields: ["OBJECTID", "TPO"],
    neg: "is not in a TPO (Tree Preservation Order) zone",
    pos: (data) => ({
      text: "is in a TPO (Tree Preservation Order) zone",
      description: data,
    }),
  },
  article4: {
    key: "article4",
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
    id: "External/Heritage",
    serverIndex: 6,
    fields: ["OBJECTID", "GRADE", "NAME", "DESCRIPTIO"],
    neg: "is not in, or within, a Listed Building",
    pos: (data) => ({
      text: `is, or is within, a Listed Building Grade ${data.GRADE}`,
      description: data.NAME,
    }),
  },
  "designated.AONB": { value: false },
  "designated.broads": { value: false },
  "defence.explosives": { value: false },
  "designated.nationalPark": { value: false },
  "defence.safeguarded": { value: false },
  hazard: { value: false },
  "nature.SSSI": { value: false },
  "designated.WHS": {
    key: "designated.WHS",
    id: "External/Heritage",
    serverIndex: 1,
    fields: ["OBJECTID", "NAME", "NOTES"],
    neg: "is not an UNESCO World Heritage Site",
    pos: (data) => ({
      text: "is an UNESCO World Heritage Site",
      description: data.NAME,
    }),
  },
};

module.exports = {
  mapServerDomain,
  planningConstraints,
};
