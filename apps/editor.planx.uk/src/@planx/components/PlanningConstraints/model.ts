import { activePlanningConstraints } from "@opensystemslab/planx-core/types";
import { richText } from "lib/yupExtensions";
import { array, object, SchemaOf, string } from "yup";

import {
  BaseNodeData,
  baseNodeDataValidationSchema,
  parseBaseNodeData,
} from "../shared";

export interface PlanningConstraints extends BaseNodeData {
  title: string;
  description: string;
  fn: string;
  disclaimer: string;
  dataValues: string[];
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
  dataValues: data?.dataValues || availableDatasets.map((d) => d.val),
  ...parseBaseNodeData(data),
});

export type IntersectingConstraints = Record<string, string[]>;

export const DEFAULT_FN = "property.constraints.planning";

export const DEFAULT_PLANNING_CONDITIONS_DISCLAIMER =
  "<p>This page does not include information about historic planning conditions that may apply to this property.</p>";

interface Dataset {
  text: string;
  val: string;
  source: "Planning Data" | "Ordnance Survey";
  datasets: string[];
  entity?: number;
}

export const availableDatasets: Dataset[] = Object.entries(
  activePlanningConstraints,
).map(([dataValue, constraint]) => ({
  text: constraint.name,
  val: dataValue,
  source: constraint.source,
  datasets:
    constraint.source === "Planning Data"
      ? constraint["digital-land-datasets"]
      : Array.from(constraint["os-dataset"]),
  entity:
    constraint.source === "Planning Data"
      ? constraint["digital-land-entities"]?.[0]
      : undefined,
}));

export const validationSchema: SchemaOf<PlanningConstraints> =
  baseNodeDataValidationSchema.concat(
    object({
      title: string().required(),
      description: richText().required(),
      fn: string().nullable().required(),
      disclaimer: richText().required(),
      dataValues: array(string().required()).min(
        1,
        "Select at least one constraint",
      ),
    }),
  );
