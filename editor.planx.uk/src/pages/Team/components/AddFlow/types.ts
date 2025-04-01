import { object, string } from "yup";

export const validationSchema = object().shape({
  mode: string().oneOf(["new", "copy", "template"]).required(),
  flow: object({
    slug: string().required("Slug is required"),
    name: string().required("Name is required"),
  }).required(),
  id: string().when("mode", {
    is: "new",
    then: string().notRequired(),
    otherwise: string().required("ID is required for copy and template modes"),
  }),
});

type NewFlow = {
  slug: string;
  name: string;
  sourceId?: string;
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
