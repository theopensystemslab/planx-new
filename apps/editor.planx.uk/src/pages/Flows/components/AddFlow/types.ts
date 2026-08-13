import type { NewFlow } from "lib/api/flow/types";
import { boolean, number, object, string } from "yup";

export const validationSchema = object().shape({
  mode: string().oneOf(["new", "copy", "template"]).required(),
  flow: object({
    slug: string().required("Slug is required"),
    name: string().required("Name is required"),
    teamId: number().integer().required("Team ID is required"),
    isPattern: boolean(),
    isTemplate: boolean(),
    isService: boolean(),
    sourceId: string().when("$mode", {
      is: "new",
      then: string().notRequired(),
      otherwise: string().required("Please select a source flow"),
    }),
  }).required(),
});

export type CreateFlow = {
  mode: "new" | "copy" | "template";
  flow: NewFlow;
};

export const CREATE_FLOW_MODES = [
  {
    mode: "new",
    title: "From scratch",
  },
  {
    mode: "template",
    title: "From a template...",
  },
  {
    mode: "copy",
    title: "Copy an existing flow...",
  },
] as const;

export type FlowTypeOption = "flow" | "service" | "pattern";

export const FLOW_TYPE_OPTIONS: {
  value: FlowTypeOption;
  title: string;
  description: string;
}[] = [
  {
    value: "flow",
    title: "Flow",
    description: "Used as a modular building block within services",
  },
  {
    value: "service",
    title: "Service",
    description: "A user-facing form that will be published and set online",
  },
];

export const PATTERN_TYPE_OPTION = {
  value: "pattern",
  title: "Pattern",
  description:
    "A set of components that can be inserted into a flow or service",
} as const;
