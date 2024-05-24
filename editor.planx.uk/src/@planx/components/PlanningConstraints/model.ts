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
  fn: data?.fn || "property.constraints.planning",
  disclaimer: data?.disclaimer || DEFAULT_PLANNING_CONDITIONS_DISCLAIMER,
  ...parseMoreInformation(data),
});

export type IntersectingConstraints = Record<string, string[]>;

export const DEFAULT_PLANNING_CONDITIONS_DISCLAIMER =
  "<p><strong>This page does not include information about historic planning conditions that may apply to this property.</strong></p>";

interface Dataset {
  name: string;
  key: string;
  source: "Planning Data" | "Ordnance Survey";
  datasets: string[];
  entity?: number;
}

export const availableDatasets: Dataset[] = [
  {
    name: "Article 4s",
    key: "article4",
    source: "Planning Data",
    datasets: ["article4-direction-area"],
  },
  {
    name: "Central Activities Zone",
    key: "article4.caz",
    source: "Planning Data",
    datasets: ["central-activities-zone"],
  },
  {
    name: "Brownfield",
    key: "brownfieldSite",
    source: "Planning Data",
    datasets: ["brownfield-land", "brownfield-site"],
  },
  {
    name: "Area of Outstanding Natural Beauty (AONB)",
    key: "designated.AONB",
    source: "Planning Data",
    datasets: ["area-of-outstanding-natural-beauty"],
  },
  {
    name: "Conservation Area",
    key: "designated.conservationArea",
    source: "Planning Data",
    datasets: ["conservation-area"],
  },
  {
    name: "Green Belt",
    key: "greenBelt",
    source: "Planning Data",
    datasets: ["green-belt"],
  },
  {
    name: "National Park",
    key: "designated.nationalPark",
    source: "Planning Data",
    datasets: ["national-park"],
  },
  {
    name: "Broads",
    key: "designated.nationalPark.broads",
    source: "Planning Data",
    datasets: ["national-park"],
    entity: 520007,
  },
  {
    name: "UNESCO World Heritage Site (WHS)",
    key: "designated.WHS",
    source: "Planning Data",
    datasets: ["world-heritage-site", "world-heritage-site-buffer-zone"],
  },
  {
    name: "Flood Risk Zones 2 & 3",
    key: "flood",
    source: "Planning Data",
    datasets: ["flood-risk-zone"],
  },
  {
    name: "Listed Building",
    key: "listed",
    source: "Planning Data",
    datasets: ["listed-building", "listed-building-outline"],
  },
  {
    name: "Scheduled Monument",
    key: "monument",
    source: "Planning Data",
    datasets: ["scheduled-monument"],
  },
  {
    name: "Ancient Semi-Natural Woodland (ASNW)",
    key: "nature.ASNW",
    source: "Planning Data",
    datasets: ["ancient-woodland"],
  },
  {
    name: "Ramsar Site",
    key: "nature.ramsar",
    source: "Planning Data",
    datasets: ["ramsar"],
  },
  {
    name: "Special Area of Conservation (SAC)",
    key: "nature.SAC",
    source: "Planning Data",
    datasets: ["special-area-of-conservation"],
  },
  {
    name: "Special Protection Area (SPA)",
    key: "nature.SPA",
    source: "Planning Data",
    datasets: ["special-protection-area"],
  },
  {
    name: "Site of Special Scientific Interest (SSSI)",
    key: "nature.SSSI",
    source: "Planning Data",
    datasets: ["site-of-special-scientific-interest"],
  },
  {
    name: "Historic Park or Garden",
    key: "registeredPark",
    source: "Planning Data",
    datasets: ["park-and-garden"],
  },
  {
    name: "Tree Preservation Order (TPO) or Zone",
    key: "tpo",
    source: "Planning Data",
    datasets: ["tree", "tree-preservation-order", "tree-preservation-zone"],
  },
  {
    name: "Classified Road",
    key: "road.classified",
    source: "Ordnance Survey",
    datasets: ["OS Mastermap Highways"],
  },
];
