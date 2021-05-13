/*
LAD20CD: E09000022
LAD20NM: Lambeth
LAD20NMW:
FID: 352

https://lambethopenmappingdata-lambethcouncil.opendata.arcgis.com/
https://gis.lambeth.gov.uk/arcgis/rest/services
*/

const mapServerDomain = "https://gis.lambeth.gov.uk";

const planningConstraints = {
  article4: {
    key: "article4",
    id: "LambethArticle4",
    fields: ["OBJECTID", "DESCRIPTION"],
    neg: "is not subject to any Article 4 directions",
    pos: (data) => {
      const text =
        data.length === 1
          ? "is subject to an Article 4 Restriction"
          : `is subject to multiple Article 4 Restrictions`;
      return {
        text,
        description: data,
      };
    },
    records: {
      // : "property.article4.lambeth.fentiman", // CA11
      1: "article4.lambeth.streatham", // CA62
      2: "article4.lambeth.stockwell", // CA05
      3: "article4.lambeth.leigham", // CA31
      4: "property.article4.lambeth.stmarks", // CA11
      5: "article4.lambeth.parkHall", // CA19
      6: "article4.lambeth.lansdowne", // CA03
      7: "article4.lambeth.albert", // CA04
      8: "article4.lambeth.hydeFarm", // CA48
    },
  },
  "designated.conservationArea": {
    key: "designated.conservationArea",
    id: "LambethConservationAreas",
    fields: ["OBJECTID", "NAME", "CA_REF_NO"],
    neg: "is not in a Conservation Area",
    pos: (data) => ({
      text: "is in a Conservation Area",
      description: data.NAME,
    }),
    records: {
      1: "designated.conservationArea.lambeth.churchRoad", // CA10 aka Lambeth Palace
    },
  },
  listed: {
    key: "listed",
    id: "LambethListedBuildings",
    fields: ["OBJECTID", "GRADE", "ADDRESS_1"],
    neg: "is not in, or within, a Listed Building",
    pos: (data) => ({
      text: `is, or is within, a ${data.GRADE}`,
      description: data.ADDRESS_1,
    }),
  },
  tpo: {
    key: "tpo",
    id: "LambethTreePreservationOrderBoundaries",
    fields: ["OBJECTID", "TPO_NUMBER", "LEGISLATION"],
    neg: "is not in a TPO (Tree Preservation Order) zone",
    pos: (data) => ({
      text: "is in a TPO (Tree Preservation Order) zone",
      description: data.LEGISLATION,
    }),
  },
  "designated.AONB": { value: false }, // LambethHistoricParksAndGardens ??
  "designated.broads": { value: false },
  "defence.explosives": { value: false },
  "designated.nationalPark": { value: false },
  "defence.safeguarded": { value: false },
  hazard: { value: false },
  "nature.SSSI": { value: false },
  "designated.WHS": { value: false }, // LambethLocalHeritageValue ??
  "designated.monument": { value: false },
  "flood.zone1": { value: false },
  "flood.zone2": {
    key: "flood.zone2",
    id: "LambethFloodRiskZone2",
    fields: ["OBJECTID"],
    neg: "is not in a Flood Zone 2",
    pos: (data) => ({
      text: "is in a Flood Zone 2 (medium risk)",
      description: data,
    }),
  },
  "flood.zone3": {
    key: "flood.zone3",
    id: "LambethFloodRiskZone3",
    fields: ["OBJECTID"],
    neg: "is not in a Flood Zone 3",
    pos: (data) => ({
      text: "is in a Flood Zone 3 (high risk)",
      description: data,
    }),
  },
};

module.exports = {
  mapServerDomain,
  planningConstraints,
};
