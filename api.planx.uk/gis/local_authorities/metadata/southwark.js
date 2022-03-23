/*
LAD20CD: E09000028
LAD20NM: Southwark
LAD20NMW:
FID: 358

https://geo.southwark.gov.uk/connect/analyst/mobile/#/main
https://environment.data.gov.uk/arcgis/rest/services
*/

const planningConstraints = {
  article4: {
    key: "article4",
    source: "Southwark Maps",
    tables: [
      "Article 4 - Class ZA - Demolition of commercial",
    ],
    columns: ["Name", "Article_4_Direction", "More_information"],
    neg: "is not subject to any Article 4 restrictions",
    pos: (data) => ({
      text: "is subject to Article 4 restriction(s)",
      description: data.Article_4_Direction,
    }),
  },
  "article4.southwark.sunray": {
    key: "article4.southwark.sunray",
    source: "Southwark Maps",
    tables: [
      "Article 4 - Sunray Estate"
    ],
    columns: ["Name", "Article_4_Direction", "More_information"],
    neg: "is not subject to any Article 4 restrictions",
    pos: (data) => ({
      text: "is subject to Article 4 restriction(s)",
      description: data.Article_4_Direction,
    }),
  },
  "article4.southwark.caz": {
    key: "article4.southwark.caz",
    source: "Southwark Maps",
    tables: [
      "Article 4 - offices in the Central Activities Zone",
    ],
    columns: ["Name", "Article_4_Direction", "More_information"],
    neg: "is not subject to any Article 4 restrictions",
    pos: (data) => ({
      text: "is subject to Article 4 restriction(s)",
      description: data.Article_4_Direction,
    }),
  },
  "article4.southwark.publichouse": {
    key: "article4.southwark.publichouse",
    source: "Southwark Maps",
    tables: [
      "Article 4 - Public Houses",
    ],
    columns: ["Name", "Article_4_Direction", "More_information"],
    neg: "is not subject to any Article 4 restrictions",
    pos: (data) => ({
      text: "is subject to Article 4 restriction(s)",
      description: data.Article_4_Direction,
    }),
  },
  "article4.southwark.hmo": {
    key: "article4.southwark.hmo",
    source: "Southwark Maps",
    tables: [
      "Article 4 - HMO Henshaw Street",
      "Article 4 - HMO Bywater Place",
    ],
    columns: ["Name", "Article_4_Direction", "More_information"],
    neg: "is not subject to any Article 4 restrictions",
    pos: (data) => ({
      text: "is subject to Article 4 restriction(s)",
      description: data.Article_4_Direction,
    }),
  },
  "article4.southwark.MA": {
    key: "article4.southwark.MA",
    source: "Southwark Maps",
    tables: [
      "Article 4 - Class MA - Change of use from Class E to residential",
    ],
    columns: ["Name", "Article_4_Direction", "More_information"],
    neg: "is not subject to any Article 4 restrictions",
    pos: (data) => ({
      text: "is subject to Article 4 restriction(s)",
      description: data.Article_4_Direction,
    }),
  },
  "article4.southwark.railway": {
    key: "article4.southwark.railway",
    source: "Southwark Maps",
    tables: [
      "Article 4 - Demolition of the Stables and the Forge on Catlin Street",
    ],
    columns: ["Name", "Article_4_Direction", "More_information"],
    neg: "is not subject to any Article 4 restrictions",
    pos: (data) => ({
      text: "is subject to Article 4 restriction(s)",
      description: data.Article_4_Direction,
    }),
  },
  "article4.southwark.southernrail": {
    key: "article4.southwark.southernrail",
    source: "Southwark Maps",
    tables: [
      "Article 4 - Railway Arches",
    ],
    columns: ["Name", "Article_4_Direction", "More_information"],
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
  "designated.AONB": {
    key: "designated.AONB",
    source: "manual", // there are no AONB in Southwark
    neg: "is not in an Area of Outstanding Natural Beauty",
  },
  "designated.nationalPark": {
    key: "designated.nationalPark",
    source: "manual", // there are no National Parks in Southwark
    neg: "is not in a National Park",
  },
  "designated.broads": {
    key: "designated.broads",
    source: "manual", // there are no Broads in Southwark
    neg: "is not in a Broad",
  },
  "designated.WHS": {
    key: "designated.WHS",
    source: "Southwark Maps",
    tables: ["UNESCO World Heritage Sites England"],
    columns: ["OGR_FID", "NAME", "NOTES"],
    neg: "is not a World Heritage Site",
    pos: (data) => ({
      text: "is a World Heritage Site",
      description: data.NAME,
    }),
  },
  "monument": { value: false },
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
  "defence.explosives": { value: false },
  "defence.safeguarded": { value: false },
  hazard: { value: false },
};

module.exports = {
  planningConstraints,
};
