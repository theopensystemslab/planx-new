type PlanningConstraintConfig = {
  active: boolean;
  neg: string;
  pos: string;
  "digital-land-datasets"?: string[];
  "digital-land-entities"?: number[];
  category: string;
};
type PlanningConstraintsBaseSchema = Record<string, PlanningConstraintConfig>;

// planx schema variables and their attributes (in the future, maybe these are managed in Editor?)
//   flag as 'active' based on dataset status/availability here https://www.planning.data.gov.uk/dataset/
//   planx passport variable names & categories come from https://docs.google.com/spreadsheets/d/1ePihRD37-2071Wq6t2Y7QtBt7juySWuVP6SAF6T-0vo/edit?usp=sharing
const baseSchema: PlanningConstraintsBaseSchema = {
  article4: {
    active: true,
    neg: "is not subject to local permitted development restrictions (known as Article 4 directions)",
    pos: "is subject to local permitted development restrictions (known as Article 4 directions)",
    "digital-land-datasets": ["article-4-direction-area"],
    category: "General policy",
  },
  "article4.caz": {
    // will be renamed to `article4.localAuthority.caz` when applicable
    active: true,
    neg: "is not in the Central Activities Zone",
    pos: "is in the Central Activities Zone",
    "digital-land-datasets": ["central-activities-zone"],
    category: "General policy",
  },
  "brownfieldSite": {
    active: true,
    neg: "is not on Brownfield land",
    pos: "is on Brownfield land",
    "digital-land-datasets": ["brownfield-land", "brownfield-site"],
    category: "General policy",
  },
  "designated.AONB": {
    active: true,
    neg: "is not in an Area of Outstanding Natural Beauty",
    pos: "is in an Area of Outstanding Natural Beauty",
    "digital-land-datasets": ["area-of-outstanding-natural-beauty"],
    category: "Heritage and conservation",
  },
  "designated.conservationArea": {
    active: true,
    neg: "is not in a Conservation Area",
    pos: "is in a Conservation Area",
    "digital-land-datasets": ["conservation-area"],
    category: "Heritage and conservation",
  },
  "designated.greenBelt": {
    active: true,
    neg: "is not in a Green Belt",
    pos: "is in a Green Belt",
    "digital-land-datasets": ["green-belt"],
    category: "Heritage and conservation",
  },
  "designated.nationalPark": {
    active: true,
    neg: "is not in a National Park",
    pos: "is in a National Park",
    "digital-land-datasets": ["national-park"],
    category: "Heritage and conservation",
  },
  "designated.nationalPark.broads": {
    active: true,
    neg: "is not in a Broad",
    pos: "is in a Broad",
    "digital-land-datasets": ["national-park"],
    "digital-land-entities": [520007], // https://www.planning.data.gov.uk/entity/520007
    category: "Heritage and conservation",
  },
  "designated.SPA": {
    active: true,
    neg: "is not in a Special Protection Area (SPA)",
    pos: "is in a Special Protection Area (SPA)",
    "digital-land-datasets": ["special-protection-area"],
    category: "Heritage and conservation",
  },
  "designated.WHS": {
    active: true,
    neg: "is not an UNESCO World Heritage Site",
    pos: "is, or is within, an UNESCO World Heritage Site",
    "digital-land-datasets": [
      "world-heritage-site",
      "world-heritage-site-buffer-zone",
    ],
    category: "Heritage and conservation",
  },
  flood: {
    active: true,
    neg: "is not in a Flood Risk Zone",
    pos: "is in a Flood Risk Zone",
    "digital-land-datasets": ["flood-risk-zone"],
    category: "Flooding",
  },
  listed: {
    active: true,
    neg: "is not, or is not within, a Listed Building",
    pos: "is, or is within, a Listed Building",
    "digital-land-datasets": ["listed-building", "listed-building-outline"], // HE publishes points, LPAs publish polygons
    category: "Heritage and conservation",
  },
  locallyListed: {
    active: true,
    neg: "is not, or is not within, a Locally Listed Building",
    pos: "is, or is within, a Locally Listed Building",
    "digital-land-datasets": ["locally-listed-building"],
    category: "Heritage and conservation",
  },
  monument: {
    active: true,
    neg: "is not the site of a Scheduled Monument",
    pos: "is the site of a Scheduled Monument",
    "digital-land-datasets": ["scheduled-monument"],
    category: "Heritage and conservation",
  },
  "nature.ASNW": {
    active: true,
    neg: "is not in an Ancient Semi-Natural Woodland (ASNW)",
    pos: "is in an Ancient Semi-Natural Woodland (ASNW)",
    "digital-land-datasets": ["ancient-woodland"],
    category: "Ecology",
  },
  "nature.ramsarSite": {
    active: true,
    neg: "is not in a Ramsar Site",
    pos: "is in a Ramsar Site",
    "digital-land-datasets": ["ramsar"],
    "category": "Ecology",
  },
  "nature.SAC": {
    active: true,
    neg: "is not in a Special Area of Conservation (SAC)",
    pos: "is in a Special Area of Conservation (SAC)",
    "digital-land-datasets": ["special-area-of-conservation"],
    category: "Ecology",
  },
  "nature.SSSI": {
    active: true,
    neg: "is not a Site of Special Scientific Interest (SSSI)",
    pos: "is a Site of Special Scientific Interest (SSSI)",
    "digital-land-datasets": ["site-of-special-scientific-interest"],
    category: "Ecology",
  },
  registeredPark: {
    active: true,
    neg: "is not in a Historic Park or Garden",
    pos: "is in a Historic Park or Garden",
    "digital-land-datasets": ["park-and-garden"],
    category: "Heritage and conservation",
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
    category: "Trees",
  },
  "defence.explosives": {
    active: false,
    neg: "is not an Explosives or Ordnance Storage site",
    pos: "is an Explosives or Ordnance Storage site",
    category: "Military and defence",
  },
  "defence.safeguarded": {
    active: false,
    neg: "is not on Safeguarded land",
    pos: "is on Safeguarded land",
    category: "Military and defence",
  },
  hazard: {
    active: false,
    neg: "is not in, or within, a Safety Hazard area",
    pos: "is, or is within, a Safety Hazard area",
    category: "Other",
  },
};

export { baseSchema };
