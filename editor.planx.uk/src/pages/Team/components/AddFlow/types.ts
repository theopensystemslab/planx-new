import { boolean, number, object, string } from "yup";

export const validationSchema = object().shape({
  mode: string().oneOf(["new", "copy", "template"]).required(),
  flow: object({
    slug: string().required("Slug is required"),
    name: string().required("Name is required"),
    teamId: number().integer().required("Team ID is required"),
    isTemplate: boolean(),
    sourceId: string().when("$mode", {
      is: "new",
      then: string().notRequired(),
      otherwise: string().required("Please select a source flow"),
    }),
  }).required(),
});

export type NewFlow = {
  slug: string;
  name: string;
  teamId: number;
  sourceId?: string;
  isTemplate?: boolean;
};

export type CreateFlow = {
  mode: "new" | "copy" | "template";
  flow: NewFlow;
};

export const CREATE_FLOW_MODES = [
  {
    mode: "new",
    title: "New flow",
  },
  {
    mode: "copy",
    title: "From copy...",
  },
  {
    mode: "template",
    title: "From template...",
  },
] as const;
