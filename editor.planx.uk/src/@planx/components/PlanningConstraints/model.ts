import { MoreInformation, parseMoreInformation } from "../shared";

export interface PlanningConstraints extends MoreInformation {
  title: string;
  description: string;
  fn: string;
  disclaimer: string;
}

export const parseContent = (
  data: Record<string, any> | undefined,
): PlanningConstraints => ({
  title: data?.title || "Planning constraints",
  description:
    data?.description ||
    "Planning constraints might limit how you can develop or use the property",
  fn: data?.fn || DEFAULT_FN,
  disclaimer: data?.disclaimer || DEFAULT_PLANNING_CONDITIONS_DISCLAIMER,
  ...parseMoreInformation(data),
});

export type IntersectingConstraints = Record<string, string[]>;

export const DEFAULT_FN = "property.constraints.planning";

export const DEFAULT_PLANNING_CONDITIONS_DISCLAIMER =
  "<p><strong>This page does not include information about historic planning conditions that may apply to this property.</strong></p>";

interface Dataset {
  text: string;
  val: string;
  source: "Planning Data" | "Ordnance Survey";
  datasets: string[];
  entity?: number;
}

export const availableDatasets: Dataset[] = [
  {
    text: "Article 4 Directions",
    val: "article4",
    source: "Planning Data",
    datasets: ["article4-direction-area"],
  },
  {
    text: "Central Activities Zones",
    val: "article4.caz",
    source: "Planning Data",
    datasets: ["central-activities-zone"],
  },
  {
    text: "Brownfields",
    val: "brownfieldSite",
    source: "Planning Data",
    datasets: ["brownfield-land", "brownfield-site"],
  },
  {
    text: "Areas of Outstanding Natural Beauty (AONB)",
    val: "designated.AONB",
    source: "Planning Data",
    datasets: ["area-of-outstanding-natural-beauty"],
  },
  {
    text: "Conservation Areas",
    val: "designated.conservationArea",
    source: "Planning Data",
    datasets: ["conservation-area"],
  },
  {
    text: "Green Belts",
    val: "greenBelt",
    source: "Planning Data",
    datasets: ["green-belt"],
  },
  {
    text: "National Parks",
    val: "designated.nationalPark",
    source: "Planning Data",
    datasets: ["national-park"],
  },
  {
    text: "Broads",
    val: "designated.nationalPark.broads",
    source: "Planning Data",
    datasets: ["national-park"],
    entity: 520007,
  },
  {
    text: "UNESCO World Heritage Sites (WHS)",
    val: "designated.WHS",
    source: "Planning Data",
    datasets: ["world-heritage-site", "world-heritage-site-buffer-zone"],
  },
  {
    text: "Flood Risk Zones",
    val: "flood",
    source: "Planning Data",
    datasets: ["flood-risk-zone"],
  },
  {
    text: "Listed Buildings",
    val: "listed",
    source: "Planning Data",
    datasets: ["listed-building", "listed-building-outline"],
  },
  {
    text: "Scheduled Monuments",
    val: "monument",
    source: "Planning Data",
    datasets: ["scheduled-monument"],
  },
  {
    text: "Ancient Semi-Natural Woodlands (ASNW)",
    val: "nature.ASNW",
    source: "Planning Data",
    datasets: ["ancient-woodland"],
  },
  {
    text: "Ramsar Sites",
    val: "nature.ramsar",
    source: "Planning Data",
    datasets: ["ramsar"],
  },
  {
    text: "Special Areas of Conservation (SAC)",
    val: "nature.SAC",
    source: "Planning Data",
    datasets: ["special-area-of-conservation"],
  },
  {
    text: "Special Protection Areas (SPA)",
    val: "nature.SPA",
    source: "Planning Data",
    datasets: ["special-protection-area"],
  },
  {
    text: "Sites of Special Scientific Interest (SSSI)",
    val: "nature.SSSI",
    source: "Planning Data",
    datasets: ["site-of-special-scientific-interest"],
  },
  {
    text: "Historic Parks or Gardens",
    val: "registeredPark",
    source: "Planning Data",
    datasets: ["park-and-garden"],
  },
  {
    text: "Tree Preservation Orders (TPO) or Zones",
    val: "tpo",
    source: "Planning Data",
    datasets: ["tree", "tree-preservation-order", "tree-preservation-zone"],
  },
  {
    text: "Classified Roads",
    val: "road.classified",
    source: "Ordnance Survey",
    datasets: ["OS Mastermap Highways"],
  },
];
