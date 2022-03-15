// planx schema variables and their possible attributes
const baseSchema = {
  article4: {
    neg: "is not subject to any Article 4 restrictions",
    pos: "is subject to Article 4 restriction(s)",
    "digital-land-datasets": ['article-4-direction'],
  },
  listed: {
    neg: "is not in, or within, a Listed Building",
    pos: "is, or is within, a Listed Building",
    "digital-land-datasets": ['listed-building', 'listed-building-outline', 'locally-listed-building'],
  },
  "designated.conservationArea": {
    neg: "is not in a Conservation Area",
    pos: "is in a Conservation Area",
  },
  "designated.AONB": {
    neg: "is not in an Area of Outstanding Natural Beauty",
    pos: "is in an Area of Outstanding Natural Beauty",
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
  "monument": {
    neg: "is not the site of a Scheduled Monument",
    pos: "is the site of a Scheduled Monument",
  },
  tpo: {
    neg: "is not in a Tree Preservation Order (TPO) Zone",
    pos: "is in a Tree Preservation Order (TPO) Zone",
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

module.exports = {
  baseSchema
};
