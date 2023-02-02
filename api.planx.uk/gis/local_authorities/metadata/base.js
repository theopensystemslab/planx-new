// planx schema variables and their attributes (in the future, maybe these are managed in Editor?)
// flag as 'active' based on dataset status/availability here https://www.planning.data.gov.uk/dataset/
const baseSchema = {
  article4: {
    active: true,
    neg: "is not subject to local permitted development restrictions (known as Article 4 directions)",
    pos: "is subject to local permitted development restrictions (known as Article 4 directions)",
    "digital-land-datasets": ["article-4-direction-area"],
  },
  "article4.caz": {
    // will be renamed to `article4.localAuthority.caz` when applicable
    active: true,
    neg: "is not in the Central Activities Zone",
    pos: "is in the Central Activities Zone",
    "digital-land-datasets": ["central-activities-zone"],
  },
  listed: {
    active: true,
    neg: "is not, or is not within, a Listed Building",
    pos: "is, or is within, a Listed Building",
    "digital-land-datasets": ["listed-building", "listed-building-outline"], // HE publishes points, LPAs publish polygons
  },
  locallyListed: {
    active: false,
    neg: "is not, or is not within, a Locally Listed Building",
    pos: "is, or is within, a Locally Listed Building",
    "digital-land-datasets": ["locally-listed-building"],
  },
  registeredPark: {
    active: true,
    neg: "is not in a Historic Park or Garden",
    pos: "is in a Historic Park or Garden",
    "digital-land-datasets": ["park-and-garden"],
  },
  "designated.conservationArea": {
    active: true,
    neg: "is not in a Conservation Area",
    pos: "is in a Conservation Area",
    "digital-land-datasets": ["conservation-area"],
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
  "designated.nationalPark.broads": {
    active: true,
    neg: "is not in a Broad",
    pos: "is in a Broad",
    "digital-land-datasets": ["national-park"],
    "digital-land-entities": [520007], // https://www.planning.data.gov.uk/entity/520007
  },
  "designated.WHS": {
    active: true,
    neg: "is not an UNESCO World Heritage Site",
    pos: "is, or is within, an UNESCO World Heritage Site",
    "digital-land-datasets": [
      "world-heritage-site",
      "world-heritage-site-buffer-zone",
    ],
  },
  "designated.SPA": {
    active: true,
    neg: "is not in a Special Protection Area (SPA)",
    pos: "is in a Special Protection Area (SPA)",
    "digital-land-datasets": ["special-protection-area"],
  },
  monument: {
    active: true,
    neg: "is not the site of a Scheduled Monument",
    pos: "is the site of a Scheduled Monument",
    "digital-land-datasets": ["scheduled-monument"],
  },
  tpo: {
    active: true,
    neg: "is not in a Tree Preservation Order (TPO) Zone",
    pos: "is in a Tree Preservation Order (TPO) Zone",
    "digital-land-datasets": [
      "tree",
      "tree-preservation-order",
      "tree-preservation-zone",
    ], // "tree" is points, "-zone" is polygons
  },
  "nature.SSSI": {
    active: true,
    neg: "is not a Site of Special Scientific Interest (SSSI)",
    pos: "is a Site of Special Scientific Interest (SSSI)",
    "digital-land-datasets": ["site-of-special-scientific-interest"],
  },
  "nature.SAC": {
    active: true,
    neg: "is not in a Special Area of Conservation (SAC)",
    pos: "is in a Special Area of Conservation (SAC)",
    "digital-land-datasets": ["special-area-of-conservation"],
  },
  "nature.ASNW": {
    active: true,
    neg: "is not in an Ancient Semi-Natural Woodland (ASNW)",
    pos: "is in an Ancient Semi-Natural Woodland (ASNW)",
    "digital-land-datasets": ["ancient-woodland"],
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

export { baseSchema };
