/*
LAD20CD: E09000022
LAD20NM: Lambeth
LAD20NMW:
FID: 352

https://lambethopenmappingdata-lambethcouncil.opendata.arcgis.com/
https://gis.lambeth.gov.uk/arcgis/rest/services
https://environment.data.gov.uk/arcgis/rest/services
*/

const lambethDomain = "https://gis.lambeth.gov.uk";
const environmentDomain = "https://environment.data.gov.uk";

const planningConstraints = {
  article4: {
    key: "article4",
    source: lambethDomain,
    id: "LambethArticle4",
    fields: ["OBJECTID", "DESCRIPTION"],
    neg: "is not subject to any Article 4 directions",
    pos: (data) => ({
      text: "is subject to an Article 4 direction(s)",
      description: data.DESCRIPTION,
    }),
    records: {
      0: "article4.lambeth.fentiman", // CA11
      1: "article4.lambeth.streatham", // CA62
      2: "article4.lambeth.stockwell", // CA05
      3: "article4.lambeth.leigham", // CA31
      4: "article4.lambeth.stmarks", // CA11
      5: "article4.lambeth.parkHall", // CA19
      6: "article4.lambeth.lansdowne", // CA03
      7: "article4.lambeth.albert", // CA04
      8: "article4.lambeth.hydeFarm", // CA48
    },
  },
  "article4.lambeth.kiba": {
    key: "article4.lambeth.kiba",
    source: lambethDomain,
    id: "LambethArticle4B1toC3",
    fields: ["OBJECTID", "NAME", "ARTICLE_4"],
    neg: "is not subject to any Article 4 directions",
    pos: (data) => ({
      text: "is subject to an Article 4 direction(s)",
      description: data.NAME,
    }),
  },
  "article4.lambeth.caz": {
    key: "article4.lambeth.caz",
    source: lambethDomain,
    id: "LambethCentralActivitiesZone",
    fields: ["OBJECTID", "TITLE", "POLICY"],
    neg: "is not subject to any Article 4 directions",
    pos: (data) => ({
      text: "is subject to an Article 4 direction(s)",
      description: data.TITLE,
    }),
  },
  listed: {
    key: "listed",
    source: lambethDomain,
    id: "LambethListedBuildings",
    fields: ["OBJECTID", "GRADE", "ADDRESS_1"],
    neg: "is not in, or within, a Listed Building",
    pos: (data) => ({
      text: `is, or is within, a ${data.GRADE}`,
      description: data.ADDRESS_1,
    }),
  },
  "designated.conservationArea": {
    key: "designated.conservationArea",
    source: lambethDomain,
    id: "LambethConservationAreas",
    fields: ["OBJECTID", "NAME", "CA_REF_NO"],
    neg: "is not in a Conservation Area",
    pos: (data) => ({
      text: "is in a Conservation Area",
      description: data.NAME,
    }),
    records: {
      1: "designated.conservationArea.lambeth.churchRoad", // CA10 aka Lambeth Palace ??
    },
  },
  "designated.AONB": {
    key: "designated.AONB",
    source: "manual", // there are no AONB in Lambeth
    neg: "is not in an Area of Outstanding Natural Beauty",
  },
  "designated.nationalPark": {
    key: "designated.nationalPark",
    source: "manual", // there are no National Parks in Lambeth
    neg: "is not in a National Park",
  },
  "designated.broads": {
    key: "designated.broads",
    source: "manual", // there are no Broads in Lambeth
    neg: "is not in a Broad",
  },
  "designated.WHS": {
    key: "designated.WHS",
    source: environmentDomain,
    id: "HE/WorldHeritageSites",
    fields: ["objectid", "name"],
    neg: "is not a World Heritage Site",
    pos: (data) => ({
      text: "is a World Heritage Site",
      description: data.name,
    }),
  },
  "designated.monument": { value: false },
  tpo: {
    key: "tpo",
    source: lambethDomain,
    id: "LambethTreePreservationOrderBoundaries",
    fields: ["OBJECTID", "TPO_NUMBER", "LEGISLATION"],
    neg: "is not in a TPO (Tree Preservation Order) zone",
    pos: (data) => ({
      text: "is in a TPO (Tree Preservation Order) zone",
      description: data.LEGISLATION,
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
  // Flood zones are not MVP variables
  // "flood.zone2": {
  //   key: "flood.zone2",
  //   source: lambethDomain,
  //   id: "LambethFloodRiskZone2",
  //   fields: ["OBJECTID"],
  //   neg: "is not in a Flood Zone 2",
  //   pos: (data) => ({
  //     text: "is in a Flood Zone 2 - Medium Risk",
  //     description: data,
  //   }),
  // },
  // "flood.zone3": {
  //   key: "flood.zone3",
  //   source: lambethDomain,
  //   id: "LambethFloodRiskZone3",
  //   fields: ["OBJECTID"],
  //   neg: "is not in a Flood Zone 3",
  //   pos: (data) => ({
  //     text: "is in a Flood Zone 3 - High Risk",
  //     description: data,
  //   }),
  // },
  "defence.explosives": { value: false },
  "defence.safeguarded": { value: false }, // https://lambethopenmappingdata-lambethcouncil.opendata.arcgis.com/datasets/safeguarded-waste-sites ??
  hazard: { value: false }, // https://lambethopenmappingdata-lambethcouncil.opendata.arcgis.com/datasets/comah-sites ??
};

module.exports = {
  planningConstraints,
};
