/*
TEST ONLY currently for TPX Impact
*/

const scottGovDomain = "https://maps.gov.scot/server";

const planningConstraints = {
  "article4": { value: false },
  "designated.nationalPark.cairngorms": {
    key: "designated.nationalPark.cairngorms",
    source: scottGovDomain,
    id: "ScotGov/ProtectedSites",
    serverIndex: 0,
    fields: ["objectid", "npcode", "npname"],
    neg: "is not in a National Park",
    pos: (data) => ({
      text: "is in Cairngorms National Park",
      description: data.npname,
    }),
  },
  "designated.nationalPark.lochLomondTrossachs": {
    key: "designated.nationalPark.lochLomondTrossachs",
    source: scottGovDomain,
    id: "ScotGov/ProtectedSites",
    serverIndex: 1,
    fields: ["objectid", "npcode", "npname"],
    neg: "is not in a National Park",
    pos: (data) => ({
      text: "is in Loch Lomond and The Trossachs National Park",
      description: data.npname, 
    }),
  },
  "designated.nationalScenicArea": {
    key: "designated.nationalScenicArea",
    source: scottGovDomain,
    id: "ScotGov/ProtectedSites",
    serverIndex: 3,
    fields: ["objectid", "nsacode", "nsaname"],
    neg: "is not in a National Scenic Area",
    pos: (data) => ({
      text: "is in a National Scenic Area",
      description: data.nsaname,
    }),
  },
  tpo: { value: false },
};

export { planningConstraints };
