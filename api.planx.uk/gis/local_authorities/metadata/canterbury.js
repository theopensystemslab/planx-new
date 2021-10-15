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
    records: {
      0: "article4.canterbury.adisham.a",
      1: "article4.canterbury.adisham.b",
      2: "article4.canterbury.barham.a",
      3: "article4.canterbury.barham.b",
      4: "article4.canterbury.barham.c",
      5: "article4.canterbury.bishopsbourne",
      6: "article4.canterbury.blean.a",
      7: "article4.canterbury.blean.b",
      8: "article4.canterbury.bridge",
      9: "article4.canterbury.brookefield",
      10: "article4.canterbury.chartham",
      11: "article4.canterbury.chestfield",
      12: "article4.canterbury.chislet.b22",
      13: "article4.canterbury.chislet.b7",
      14: "article4.canterbury.city",
      15: "article4.canterbury.denstroude.03A",
      16: "article4.canterbury.denstroude.3",
      17: "article4.canterbury.fordwich",
      18: "article4.canterbury.fouracres",
      19: "article4.canterbury.graveneymarshes",
      20: "article4.canterbury.hackington",
      21: "article4.canterbury.harbledown.b35",
      22: "article4.canterbury.harbledown.b5",
      23: "article4.canterbury.herne",
      24: "article4.canterbury.hernebay",
      25: "article4.canterbury.hoath.b17",
      26: "article4.canterbury.hoath.b23",
      27: "article4.canterbury.ickham.b24",
      28: "article4.canterbury.ickham.b26",
      29: "article4.canterbury.ickham.b8",
      30: "article4.canterbury.kemberlandwood",
      31: "article4.canterbury.kingston",
      32: "article4.canterbury.littlebourne",
      33: "article4.canterbury.lovelane",
      34: "article4.canterbury.lowerhardres",
      35: "article4.canterbury.mountswood",
      36: "article4.canterbury.nackington",
      37: "article4.canterbury.nelsonroad",
      38: "article4.canterbury.patrixbourne",
      39: "article4.canterbury.pennypotwoods",
      40: "article4.canterbury.petham.b19",
      41: "article4.canterbury.petham.b31",
      42: "article4.canterbury.sanpitwood",
      43: "article4.canterbury.southwhitstable",
      44: "article4.canterbury.stmartinshospital.c1",
      45: "article4.canterbury.stmartinshospital.c2",
      46: "article4.canterbury.stodmarsh",
      47: "article4.canterbury.sturry",
      48: "article4.canterbury.thruxtedmarshes",
      49: "article4.canterbury.tylerhill",
      50: "article4.canterbury.upperharbledown",
      51: "article4.canterbury.upperhardres.b38",
      52: "article4.canterbury.upperhardres.b6",
      53: "article4.canterbury.vikingsestate",
      54: "article4.canterbury.walderchainwood.1",
      55: "article4.canterbury.walderchainwood.2",
      56: "article4.canterbury.waltham",
      57: "article4.canterbury.watermill",
      58: "article4.canterbury.westbere",
      59: "article4.canterbury.whitstable.b13",
      60: "article4.canterbury.whitstable.b32",
      61: "article4.canterbury.whitstablebeach",
      62: "article4.canterbury.whitstableconservation",
      63: "article4.canterbury.womenswold.b15",
      64: "article4.canterbury.womenswold.b41",
      65: "article4.canterbury.yorkletts",
    },
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
    neg: "is not in an Area of Outstanding Natural Beauty",
    pos: (data) => ({
      text: "is in an Area of Outstanding Natural Beauty",
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
