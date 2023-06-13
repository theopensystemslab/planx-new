/*
TEST ONLY currently for TPX Impact
*/

const scotGovDomain = "https://maps.gov.scot/server";
const inspireHESDomain = "https://inspire.hes.scot/arcgis";

const planningConstraints = {
  "article4": { value: false },
  "designated.conservationArea": {
    key: "designated.conservationArea",
    source: inspireHESDomain,
    id: "HES/HES_Designations",
    serverIndex: 2,
    fields: ["OBJECTID", "DES_TITLE", "LINK"],
    neg: "is not in a Conservation Area",
    pos: (data) => ({
      text: "is in a Conservation Area",
      description: data.DES_TITLE,
    }),
    category: "Heritage and conservation",
  },
  "designated.nationalPark.cairngorms": {
    key: "designated.nationalPark.cairngorms",
    source: scotGovDomain,
    id: "ScotGov/ProtectedSites",
    serverIndex: 0,
    fields: ["objectid", "npcode", "npname"],
    neg: "is not in a National Park",
    pos: (data) => ({
      text: "is in Cairngorms National Park",
      description: data.npname,
    }),
    category: "Heritage and conservation",
  },
  "designated.nationalPark.lochLomondTrossachs": {
    key: "designated.nationalPark.lochLomondTrossachs",
    source: scotGovDomain,
    id: "ScotGov/ProtectedSites",
    serverIndex: 1,
    fields: ["objectid", "npcode", "npname"],
    neg: "is not in a National Park",
    pos: (data) => ({
      text: "is in Loch Lomond and The Trossachs National Park",
      description: data.npname, 
    }),
    category: "Heritage and conservation",
  },
  "designated.nationalScenicArea": {
    key: "designated.nationalScenicArea",
    source: scotGovDomain,
    id: "ScotGov/ProtectedSites",
    serverIndex: 3,
    fields: ["objectid", "nsacode", "nsaname"],
    neg: "is not in a National Scenic Area",
    pos: (data) => ({
      text: "is in a National Scenic Area",
      description: data.nsaname,
    }),
    category: "Heritage and conservation",
  },
  "designated.WHS": {
    key: "designated.WHS",
    source: inspireHESDomain,
    id: "HES/HES_Designations",
    serverIndex: 6,
    fields: ["DES_REF", "DES_TITLE"],
    neg: "is not, or is not within, an UNESCO World Heritage Site",
    pos: (data) => ({
      text: "is, or is within, an UNESCO World Heritage Site",
      description: data.DES_TITLE,
    }),
    category: "Heritage and conservation",
  },
  listed: {
    key: "listed",
    source: inspireHESDomain,
    id: "HES/HES_Designations",
    serverIndex: 7,
    fields: ["DES_REF", "DES_TITLE", "CATEGORY", "LINK"],
    neg: "is not, or is not within, a Listed Building",
    pos: (data) => ({
      text: `is, or is within, a Listed Building (Category ${data.CATEGORY})`,
      description: data.DES_TITLE,
    }),
    category: "Heritage and conservation",
  },
  monument: {
    key: "monument",
    source: inspireHESDomain,
    id: "HES/HES_Designations",
    serverIndex: 5,
    fields: ["DES_REF", "DES_TITLE", "LINK"],
    neg: "is not the site of a Scheduled Monument",
    pos: (data) => ({
      text: "is the site of a Scheduled Monument",
      description: data.DES_TITLE,
    }),
    category: "Heritage and conservation",
  },
  tpo: { value: false },
};

export { planningConstraints };
