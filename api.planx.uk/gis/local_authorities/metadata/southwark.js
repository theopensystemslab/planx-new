/*
LAD20CD: E09000028
LAD20NM: Southwark
LAD20NMW:
FID: 358

https://geo.southwark.gov.uk/connect/analyst/mobile/#/main
https://environment.data.gov.uk/arcgis/rest/services
*/

const environmentDomain = "https://environment.data.gov.uk";

const planningConstraints = {
  article4: {},
  listed: {
    key: "listed",
    source: "Southwark Maps",
    tables: [ // order from least to most significant grade
      "Listed buildings (Southwark) Grade II",
      "Listed buildings (Southwark) Grade II star",
      "Listed buildings (Southwark) Grade I",
    ],
    columns: [
      "ID",
      "NAME",
      "STREET_NUMBER",
      "STREET",
      "GRADE",
      "DATE_OF_LISTING",
      "LISTING_DESCRIPTION",
    ],
    neg: "is not in, or within, a Listed Building",
    pos: (data) => ({
      text: `is, or is within, a Grade ${data.GRADE} listed building`,
      description: data.LISTING_DESCRIPTION
        ? data.LISTING_DESCRIPTION
        : data.NAME,
    }),
  },
  "designated.conservationArea": {
    key: "designated.conservationArea",
    source: "Southwark Maps",
    tables: ["Conservation areas"],
    columns: [
      "Conservation_area",
      "Conservation_area_number",
      "More_information",
    ],
    neg: "is not in a Conservation Area",
    pos: (data) => ({
      text: "is in a Conservation Area",
      description: data.More_information
        ? data.More_information
        : data.Conservation_area,
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
    source: "Southwark Maps",
    tables: [
      "TPO_zones___Woodland_type",
      "TPO_zones___Individual_type",
      "TPO_zones___Group_type",
      "TPO_zones___Area_type",
      "TPO_zones___Historic_type",
    ],
    columns: ["Location", "TPO_document"],
    neg: "is not in a TPO (Tree Preservation Order) zone",
    pos: (data) => ({
      text: "is in a TPO (Tree Preservation Order) zone",
      description: data.TPO_document ? data.TPO_document : data.Location,
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
