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
  article4: {
    key: "article4",
    source: "Southwark Maps",
    tables: [
      "Article 4 - Sunray Estate",
      "Article 4 - offices in the Central Activities Zone",
      "Article 4 - Public Houses",
      "Article 4 - HMO Henshaw Street",
      "Article 4 - HMO Bywater Place",
      "Article 4 - Light Industrial",
      "Article 4 - Town Centres A3 - A5 to A2 and from A1 – A5 B1 D1 and D2 to flexible uses",
      "Article 4 - Town Centres A1 to A2",
      "Article 4 - Railway Arches",
      "Article 4 - Demolition of the Stables and the Forge on Catlin Street",
    ],
    columns: [
      "Article_4_Direction",
      "More_information",
    ],
    neg: "is not subject to any Article 4 restrictions",
    pos: (data) => ({
      text: "is subject to Article 4 restriction(s)",
      description: data.Article_4_Direction,
    }),
  },
  listed: { 
    key: "listed",
    source: "Southwark Maps",
    tables: [
      // order from least to most significant grade
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
  "designated.AONB": { value: false },
  "designated.nationalPark": { value: false },
  "designated.broads": { value: false },
  "designated.WHS": {
    key: "designated.WHS",
    source: "Southwark Maps",
    tables: [
      "UNESCO World Heritage Sites England"
    ],
    columns: [
      "OGR_FID",
      "NAME",
      "NOTES",
    ],
    neg: "is not a World Heritage Site",
    pos: (data) => ({
      text: "is a World Heritage Site",
      description: data.NAME,
    }),
  },
  "designated.monument": {
    key: "designated.monument",
    source: "Southwark Maps", // TODO debug access-denied error, or swap to ESRI source
    tables: [
      "Scheduled Monuments"
    ],
    columns: [
      "ListEntry",
      "Name",
      "SchedDate",
      "Hyperlink",
    ],
    neg: "is not the site of a Scheduled Monument",
    pos: (data) => ({
      text: "is the site of a Scheduled Monument",
      description: data.Name,
    }),
  },
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
  "nature.SSSI": { value: false },
  "nature.ASNW": {
    key: "nature.ANSW",
    source: "Southwark Maps",
    tables: [
      "Areas of ancient woodland from Natural England (Southwark)"
    ],
    columns: ["OBJECTID", "NAME", "THEME"],
    neg: "is not within an Ancient Woodland area",
    pos: "is within an Ancient Woodland area",
  },
  "defence.explosives": { value: false },
  "defence.safeguarded": { value: false },
  hazard: { value: false },
};

module.exports = {
  planningConstraints,
};
