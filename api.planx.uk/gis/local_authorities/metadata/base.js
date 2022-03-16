// planx schema variables and their attributes (in the future, maybe these are managed in Editor?)
const baseSchema = {
  article4: {
    active: true,
    neg: "is not subject to any Article 4 restrictions",
    pos: "is subject to Article 4 restriction(s)",
    "digital-land-datasets": ["article-4-direction"],
  },
  listed: {
    active: true,
    neg: "is not in, or within, a Listed Building",
    pos: "is, or is within, a Listed Building",
    "digital-land-datasets": ["listed-building", "listed-building-outline", "locally-listed-building"],
  },
  "designated.conservationArea": {
    active: true,
    neg: "is not in a Conservation Area",
    pos: "is in a Conservation Area",
    "digital-land-datasets": ["conservation-area"]
  },
  "designated.AONB": {
    active: true,
    neg: "is not in an Area of Outstanding Natural Beauty",
    pos: "is in an Area of Outstanding Natural Beauty",
    "digital-land-datasets": ["area-of-outstanding-natural-beauty"],
  },
  "designated.nationalPark": {
    active: true,
    neg: "is not in a National Park",
    pos: "is in a National Park",
    "digital-land-datasets": ["national-park"],
  },
  "designated.broads": {
    active: false,
    neg: "is not in a Broad",
    pos: "is in a Broad",
    "digital-land-datasets": ["national-park"] // TODO filter on record https://www.digital-land.info/entity/520007
  },
  "designated.WHS": {
    active: true,
    neg: "is not an UNESCO World Heritage Site",
    pos: "is, or is within, an UNESCO World Heritage Site",
    "digital-land-datasets": ["world-heritage-site"],
  },
  "monument": {
    active: true,
    neg: "is not the site of a Scheduled Monument",
    pos: "is the site of a Scheduled Monument",
    "digital-land-datasets": ["scheduled-monument"],
  },
  tpo: {
    active: true,
    neg: "is not in a Tree Preservation Order (TPO) Zone",
    pos: "is in a Tree Preservation Order (TPO) Zone",
    "digital-land-datasets": ["tree-preservation-order", "tree-preservation-zone"],
  },
  "nature.SSSI": {
    active: true,
    neg: "is not a Site of Special Scientific Interest (SSSI)",
    pos: "is a Site of Special Scientific Interest (SSSI)",
    "digital-land-datasets": ["site-of-special-scientific-interest"],
  },
  "flood.zone1": {
    active: false,
    neg: "is not within a Flood Zone 1 (low risk)",
    pos: "is within a Flood Zone 1 (low risk)",
  },
  "flood.zone2": {
    active: false,
    neg: "is not within a Flood Zone 2 (medium risk)",
    pos: "is within a Flood Zone 2 (medium risk)",
  },
  "flood.zone3": {
    active: false,
    neg: "is not within a Flood Zone 3 (high risk)",
    pos: "is within a Flood Zone 3 (high risk)",
  },
  "defence.explosives": {
    active: false,
    neg: "is not an Explosives or Ordnance Storage site",
    pos: "is an Explosives or Ordnance Storage site",
  },
  "defence.safeguarded": {
    active: false,
    neg: "is not on Safeguarded land",
    pos: "is on Safeguarded land",
  },
  hazard: {
    active: false,
    neg: "is not in, or within, a Safety Hazard area",
    pos: "is, or is within, a Safety Hazard area",
  },
};

module.exports = {
  baseSchema
};
