// Not in use, but outlining anyways since questions around eventually showing short explanations of what each variable means in the preview came up
const spatialResults = {
  article4: {
    neg: "is not subject to any Article 4 restrictions",
    pos: "is subject to Article 4 restriction(s)",
    means: "Article 4 directions are made under the General Permitted Development Order and enable the Secretary of State or the local planning authority to withdraw specified permitted development rights across a defined area",
    source: "https://www.gov.uk/guidance/when-is-permission-required",
  },
  listed: {
    neg: "is not in, or within, a Listed Building",
    pos: "is, or is within, a Listed Building",
    means: "Listed Buildings are protected due to special architectural or historic interests by the National Heritage List for England", 
    source: "https://historicengland.org.uk/listing/what-is-designation/listed-buildings/",
  },
  "designated.conservationArea": {
    neg: "is not in a Conservation Area",
    pos: "is in a Conservation Area",
    means: "Conservation Areas have extra planning controls and considerations in place to protect the historic and architectural elements which make the place special",
    source: "https://historicengland.org.uk/listing/what-is-designation/local/conservation-areas/",
  },
  "designated.AONB": {
    neg: "is not in an Area of Outstanding Natural Beauty",
    pos: "is in an Area of Outstanding Natural Beauty",
    means: "An Area of Outstanding Natural Beauty (AONB) is land protected by the Countryside and Rights of Way Act 2000 (CROW Act) to conserve and enhance its natural beauty",
    source: "https://www.gov.uk/guidance/areas-of-outstanding-natural-beauty-aonbs-designation-and-management",
  },
  "designated.nationalPark": {
    neg: "is not in a National Park",
    pos: "is in a National Park",
  },
  "designated.broads": {
    neg: "is not in a Broad",
    pos: "is in a Broad",
  },
  "designated.WHS": {
    neg: "is not an UNESCO World Heritage Site",
    pos: "is, or is within, an UNESCO World Heritage Site",
  },
  "designated.monument": {
    neg: "is not the site of a Scheduled Monument",
    pos: "is the site of a Scheduled Monument",
  },
  tpo: {
    neg: "is not in a TPO (Tree Preservation Order) Zone",
    pos: "is in a TPO (Tree Preservation Order) Zone",
    means: "Tree Preservation Orders (TPO) are made by local planning authorities to protect specific trees, groups of trees or woodlands in the interests of amenity",
    source: "https://www.gov.uk/guidance/tree-preservation-orders-and-trees-in-conservation-areas",
  },
  "nature.SSSI": {
    neg: "is not a Site of Special Scientific Interest (SSSI)",
    pos: "is a Site of Special Scientific Interest (SSSI)",
  },
  "flood.zone1": {
    neg: "is not within a Flood Zone 1 (low risk)",
    pos: "is within a Flood Zone 1 (low risk)",
  },
  "flood.zone2": {
    neg: "is not within a Flood Zone 2 (medium risk)",
    pos: "is within a Flood Zone 2 (medium risk)",
  },
  "flood.zone3": {
    neg: "is not within a Flood Zone 3 (high risk)",
    pos: "is within a Flood Zone 3 (high risk)",
  },
  "defence.explosives": {
    neg: "is not an Explosives or Ordnance Storage site",
    pos: "is an Explosives or Ordnance Storage site",
  },
  "defence.safeguarded": {
    neg: "is not on Safeguarded land",
    pos: "is on Safeguarded land",
  },
  hazard: {
    neg: "is not in, or within, a Safety Hazard area",
    pos: "is, or is within, a Safety Hazard area",
  },
};
