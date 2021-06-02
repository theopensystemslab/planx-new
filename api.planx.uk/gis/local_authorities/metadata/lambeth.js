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
    where: "ARTICLE_4='KIBA'",
    neg: "is not subject to any Article 4 directions",
    pos: (data) => ({
      text: "is subject to an Article 4 B1 to C3 direction",
      description: data.NAME,
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
  // "designated.AONB": {
  //   key: "designated.AONB",
  //   source: environmentDomain,
  //   id: "NE/AreasOfOutstandingNaturalBeautyEngland",
  //   fields: ["objectid", "code", "name", "desig_date", "hotlink"],
  //   neg: "is not an Area of Outstanding Natural Beauty",
  //   pos: (data) => ({
  //     text: "is, or is within, an Area of Outstanding Natural Beauty",
  //     description: data.name,
  //   }),
  // },
  // "designated.nationalPark": {
  //   key: "designated.nationalPark",
  //   source: environmentDomain,
  //   id: "NE/NationalParksEngland",
  //   fields: ["objectid", "code", "name", "status", "hotlink"],
  //   neg: "is not a National Park",
  //   pos: (data) => ({
  //     text: "is, or is within, a National Park",
  //     description: data.name,
  //   }),
  // },
  "designated.broads": { value: false },
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
  // "designated.monument": {
  //   key: "designated.monument",
  //   source: environmentDomain,
  //   id: "HE/ScheduledMonuments", // TODO debug response "requested operation 'query' not supported"
  //   fields: ["objectid", "name", "scheddate"],
  //   neg: "is not the site of a Scheduled Monument",
  //   pos: (data) => ({
  //     text: "is the site of a Scheduled Monument",
  //     description: data.name,
  //   }),
  // },
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
  "flood.zone2": {
    key: "flood.zone2",
    source: lambethDomain,
    id: "LambethFloodRiskZone2",
    fields: ["OBJECTID"],
    neg: "is not in a Flood Zone 2",
    pos: (data) => ({
      text: "is in a Flood Zone 2 - Medium Risk",
      description: data,
    }),
  },
  "flood.zone3": {
    key: "flood.zone3",
    source: lambethDomain,
    id: "LambethFloodRiskZone3",
    fields: ["OBJECTID"],
    neg: "is not in a Flood Zone 3",
    pos: (data) => ({
      text: "is in a Flood Zone 3 - High Risk",
      description: data,
    }),
  },
  "defence.explosives": { value: false },
  "defence.safeguarded": { value: false }, // https://lambethopenmappingdata-lambethcouncil.opendata.arcgis.com/datasets/safeguarded-waste-sites ??
  hazard: { value: false }, // https://lambethopenmappingdata-lambethcouncil.opendata.arcgis.com/datasets/comah-sites ??
};

module.exports = {
  planningConstraints,
};
