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
    fields: ["OBJECTID", "REF", "LOCATION_1", "DESCRIPTIO"],
    neg: "is not subject to any Article 4 Restrictions",
    pos: (data) => ({
      text: "is subject to Article 4 Restriction(s)",
      description: data.LOCATION_1,
    }),
    records: { // planx value to "REF" lookup
      "article4.canterbury.adisham.a": "Article 4 Direction No 6 2003",
      "article4.canterbury.adisham.b": "Article 4 Direction No 15 2003",
      "article4.canterbury.barham.a": "Article 4 Direction No 3 2003",
      "article4.canterbury.barham.b": "Article 4 Direction No 17 2003",
      "article4.canterbury.barham.c": "Article 4 Direction No 31 2003",
      "article4.canterbury.bishopsbourne": "Article 4 Direction No 4 2003",
      "article4.canterbury.blean.a": "Article 4 Direction No 5 2003",
      "article4.canterbury.blean.b": "Article 4 Direction No 2 2003",
      "article4.canterbury.bridge": "Article 4 Direction No 10 2003",
      "article4.canterbury.brookfield": "ARTICLE 4",
      "article4.canterbury.chartham": "Article 4 Direction No 12 2003",
      "article4.canterbury.chestfield": "Article 4 Direction No 13 2003",
      "article4.canterbury.chisit.a": "Article 4 Direction No 23 2003",
      "article4.canterbury.chisit.b": "Article 4 Direction No 8 2003",
      "article4.canterbury.city": "Article 4 Direction 1985",
      "article4.canterbury.denstroude.a": "Article 4 Direction No 2 1993",
      "article4.canterbury.denstroude.b": "Article 4 Direction No 1 1993",
      "article4.canterbury.fordwich": "Article 4 Direction No 19 2003",
      "article4.canterbury.fourAcres": "Article 4 Direction No 1 1994",
      "article4.canterbury.graveneyMarshes": "Article 4 Direction No 3 1976",
      "article4.canterbury.hackington": "Article 4 Direction No 37 2003",
      "article4.canterbury.harbledown.a": "Article 4 Direction No 21 2003",
      "article4.canterbury.harbledown.b": "Article 4 Direction No 11 2003",
      "article4.canterbury.herne": "Article 4 Direction No 22 2003",
      "article4.canterbury.herneBay": "Article 4 Direction 1997 - Her",
      // "article4.canterbury.hmo": "The Canterbury HMO Article 4 D",
      "article4.canterbury.hoath.a": "Article 4 Direction No 18 2003",
      "article4.canterbury.hoath.b": "Article 4 Direction No 24 2003",
      "article4.canterbury.ickham.a": "Article 4 Direction No 25 2003",
      "article4.canterbury.ickham.b": "Article 4 Direction No 27 2003",
      "article4.canterbury.ickhamWickhambreaux": "Article 4 Direction No 9 2003",
      "article4.canterbury.kemberlandWood": "Article 4 Direction No 1 1979",
      "article4.canterbury.kingston": "Article 4 Direction No 26 2003",
      "article4.canterbury.littlebourne": "Article 4 Direction No 28 2003",
      "article4.canterbury.lovelane": "Article 4 Direction 1985",
      "article4.canterbury.lowerHardres": "Article 4 Direction No 29 2003",
      "article4.canterbury.mountsWoods": "Article 4 Direction 1995",
      "article4.canterbury.nackington": "Article 4 Direction No 30 2003",
      "article4.canterbury.nelsonroad": "Article 4 Direction, 1985",
      "article4.canterbury.patrixbourne": "Article 4 Direction No 2 2004",
      "article4.canterbury.pennyPot": "Article 4 Direction No 1 1976",
      "article4.canterbury.petham.a": "Article 4 Direction No 20 2003",
      "article4.canterbury.petham.b": "Article 4 Direction No 32 2003",
      "article4.canterbury.sandpitWood": "Article 4 Direction 1989",
      "article4.canterbury.southWhitstable": "Article 4 Direction No 33 2003",
      "article4.canterbury.stMartinsHospital.a": "Article 4 Direction No 1 2004",
      "article4.canterbury.stMartinsHospital.b": "Article 4 Direction No 1 2004",
      "article4.canterbury.stodmarsh": "Article 4 Direction No 35 2003",
      "article4.canterbury.sturry": "Article 4 Direction No 36 2003",
      "article4.canterbury.tylerHill": "Article 4 Direction No 37 2003",
      "article4.canterbury.upperHarbledown": "Article 4 Direction No 38 2003",
      "article4.canterbury.upperHardres.a": "Article 4 Direction No 39 2003",
      "article4.canterbury.upperHardres.b": "Article 4 Direction No 7 2003",
      "article4.canterbury.vikingsEstate": "Article 4 Direction No 1 1972",
      "article4.canterbury.walderchainWood.a": "Article 4 Direction No 1 1991",
      "article4.canterbury.walderchainWood.b": "Article 4 Direction No 2 1991",
      "article4.canterbury.waltham": "Article 4 Direction No 40 2003",
      "article4.canterbury.watermill": "Article 4 Direction 1986",
      "article4.canterbury.westbere": "Article 4 Direction No 41 2003",
      "article4.canterbury.whitstable.a": "Article 4 Direction No 14 2003",
      "article4.canterbury.whitstable.b": "Article 4 Direction No 33 2003",
      "article4.canterbury.whitstableBeach": "Article 4 Direction 2003",
      "article4.canterbury.whitstableConservation": "Article 4 Direction 1996 - Whi",
      "article4.canterbury.womenswold.a": "Article 4 Direction No 16 2003",
      "article4.canterbury.womenswold.b": "Article 4 Direction No 42 2003",
      "article4.canterbury.yorkletts": "Article 4 Direction No 2 1976",
    },
  },
  "article4.canterbury.hmo": {
    key: "article4.canterbury.hmo",
    source: canterburyDomain,
    id: "External/Planning_Constraints_New",
    serverIndex: 6,
    fields: ["OBJECTID", "REF", "LOCATION_1", "DESCRIPTIO"],
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
