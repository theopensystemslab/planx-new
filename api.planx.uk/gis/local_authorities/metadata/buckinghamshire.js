/*
LAD20CD: E06000060
LAD20NM: Buckinghamshire
LAD20NMW:
FID: 135

https://maps.buckscc.gov.uk/arcgis/rest/services/PLANNING/RIPA_BOPS/MapServer/
https://environment.data.gov.uk/arcgis/rest/services
https://inspire.wycombe.gov.uk/ (legacy)
*/

const bucksDomain = "https://maps.buckscc.gov.uk";
const environmentDomain = "https://environment.data.gov.uk";

const planningConstraints = {
  article4: {
    key: "article4",
    source: bucksDomain,
    id: "PLANNING/RIPA_BOPS",
    serverIndex: 4,
    fields: ["OBJECTID", "DEV_TYPE", "DESCRIPTIO", "DISTRICT", "DATE_CONF"],
    neg: "is not subject to any Article 4 restrictions",
    pos: (data) => ({
      text: "is subject to Article 4 restriction(s)",
      description: data.DESCRIPTIO,
    }),
    records: {
      0: "article4.buckinghamshire.AD186731",
      1: "article4.buckinghamshire.AD285884",
      2: "article4.buckinghamshire.AD287247",
      3: "article4.buckinghamshire.AD390975",
      4: "article4.buckinghamshire.amershamroad",
      5: "article4.buckinghamshire.amershamroadeast",
      6: "article4.buckinghamshire.bakerswood",
      7: "article4.buckinghamshire.bakerswoodbrokengate",
      8: "article4.buckinghamshire.ballingerroadnorth",
      9: "article4.buckinghamshire.boismoorroad",
      10: "article4.buckinghamshire.bourneend",
      11: "article4.buckinghamshire.bovingdonheights",
      12: "article4.buckinghamshire.bovingdonheights.a",
      13: "article4.buckinghamshire.bovingdonheights.b",
      14: "article4.buckinghamshire.bryantsbottomroad",
      15: "article4.buckinghamshire.chessfieldparkenclosure",
      16: "article4.buckinghamshire.commonwoodenclosure",
      17: "article4.buckinghamshire.commonwoodpennroad",
      18: "article4.buckinghamshire.cooperskinslaneenclosure",
      19: "article4.buckinghamshire.copperkinslanecaravan",
      20: "article4.buckinghamshire.cryershillroad",
      21: "article4.buckinghamshire.deanfield",
      22: "article4.buckinghamshire.ferrylane",
      23: "article4.buckinghamshire.georgegreen",
      24: "article4.buckinghamshire.gravellyway",
      25: "article4.buckinghamshire.greenstreetfarm",
      26: "article4.buckinghamshire.hampdenroad",
      27: "article4.buckinghamshire.junctionhughendenroad",
      28: "article4.buckinghamshire.lakeendroad",
      29: "article4.buckinghamshire.lodgelane",
      30: "article4.buckinghamshire.lodgelaneenclosure",
      31: "article4.buckinghamshire.mansionlanesouth",
      32: "article4.buckinghamshire.mansionlanewest",
      33: "article4.buckinghamshire.ministrywharf",
      35: "article4.buckinghamshire.nightingaleslane",
      36: "article4.buckinghamshire.northpark",
      37: "article4.buckinghamshire.officetoresi",
      38: "article4.buckinghamshire.os262",
      39: "article4.buckinghamshire.os3313",
      40: "article4.buckinghamshire.os5200",
      41: "article4.buckinghamshire.os6961",
      42: "article4.buckinghamshire.os8050",
      43: "article4.buckinghamshire.pednorroadcaravan",
      44: "article4.buckinghamshire.pednorroaddrydelllane",
      45: "article4.buckinghamshire.pednorroadenclosure",
      46: "article4.buckinghamshire.pennroad",
      47: "article4.buckinghamshire.phillipshillfarm",
      48: "article4.buckinghamshire.potterrowcaravan",
      49: "article4.buckinghamshire.potterrowenclosure",
      50: "article4.buckinghamshire.poultry",
      51: "article4.buckinghamshire.robertswooddrive",
      52: "article4.buckinghamshire.saunderton",
      53: "article4.buckinghamshire.sedgesfarm",
      54: "article4.buckinghamshire.sheepcotedellroad",
      55: "article4.buckinghamshire.sibleyscoppice",
      56: "article4.buckinghamshire.skimmersorchard",
      57: "article4.buckinghamshire.stokenchurch",
      58: "article4.buckinghamshire.threeoaksfarm",
      59: "article4.buckinghamshire.valleyroad",
      60: "article4.buckinghamshire.wellcottage",
      61: "article4.buckinghamshire.woodlandsmeadow",
      62: "article4.buckinghamshire.wyburnwood",
      63: "article4.buckinghamshire.wycombehealthfarmnortheast",
      64: "article4.buckinghamshire.wycombehealthfarmspurlands",
    },
  },
  listed: {
    key: "listed",
    source: bucksDomain,
    id: "PLANNING/RIPA_BOPS",
    serverIndex: 1,
    fields: ["OBJECTID", "GRADE", "DESCRIPTIO", "ADDRESS"],
    neg: "is not in, or within, a Listed Building",
    pos: (data) => ({
      text: `is, or is within, a Listed Building Grade ${data.GRADE}`,
      description: data.DESCRIPTIO,
    }),
  },
  "designated.conservationArea": {
    key: "designated.conservationArea",
    source: bucksDomain,
    id: "PLANNING/RIPA_BOPS",
    serverIndex: 0,
    fields: ["OBJECTID", "Name", "Desc_", "Grade"],
    neg: "is not in a Conservation Area",
    pos: (data) => ({
      text: "is in a Conservation Area",
      description: data.Name,
    }),
  },
  "designated.AONB": {
    key: "designated.AONB",
    source: bucksDomain,
    id: "PLANNING/RIPA_BOPS",
    serverIndex: 3,
    fields: ["OBJECTID", "NAME", "DESCRIPTIO"],
    neg: "is not an Area of Outstanding Natural Beauty",
    pos: (data) => ({
      text: "is, or is within, an Area of Outstanding Natural Beauty",
      description: data.NAME,
    }),
  },
  "designated.nationalPark": {
    key: "designated.nationalPark",
    source: "manual", // there are no National Parks in Bucks
    neg: "is not in a National Park",
  },
  "designated.broads": {
    key: "designated.broads",
    source: "manual", // there are no Broads in Bucks
    neg: "is not in a Broad",
  },
  "designated.WHS": {
    key: "designated.WHS",
    source: "manual", // there are no WHS in Bucks
    neg: "is not an UNESCO World Heritage Site",
  },
  "designated.monument": {
    key: "designated.monument",
    source: bucksDomain,
    id: "PLANNING/RIPA_BOPS",
    serverIndex: 2,
    fields: ["OBJECTID", "Name", "Desc_"],
    neg: "is not the site of a Scheduled Ancient Monument",
    pos: (data) => ({
      text: "is the site of a Scheduled Ancient Monument",
      description: data.Name,
    }),
  },
  tpo: {
    key: "tpo",
    source: bucksDomain,
    id: "PLANNING/RIPA_BOPS",
    serverIndex: 5,
    fields: ["OBJECTID", "ORDERREF", "STATUS", "COMMENTS"],
    neg: "is not in a TPO (Tree Preservation Order) zone",
    pos: (data) => ({
      text: "is in a TPO (Tree Preservation Order) zone",
      description: data.COMMENTS,
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
