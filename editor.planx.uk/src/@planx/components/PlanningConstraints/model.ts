import { MoreInformation, parseMoreInformation } from "../shared";

export interface PlanningConstraints extends MoreInformation {
  title: string;
  description: string;
  fn: string;
}

export const parseContent = (
  data: Record<string, any> | undefined
): PlanningConstraints => ({
  title: data?.title || "Planning constraints",
  description:
    data?.description ||
    "Planning constraints might limit how you can develop or use the property",
  fn: data?.fn || "property.constraints.planning",
  ...parseMoreInformation(data),
});

export type Constraint = {
  fn: string;
  value: boolean;
  text?: string;
  data?: Array<Record<string, any>>;
  category?: string;
};

export type Metadata = {
  dataset: string;
  description: string;
  name: string;
  plural: string;
  text: string;
  typology: string;
  themes: string[];
  "entity-count": {
    dataset: Metadata["dataset"];
    count: number;
  };
  attribution: string;
  "attribution-text": string;
  license: string;
  "license-text": string;
};

export type GISResponse = {
  url?: string;
  constraints: Record<Constraint["fn"], Constraint>;
  metadata?: Record<Constraint["fn"], Metadata>;
};
