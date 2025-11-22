import type { TeamTheme } from "@opensystemslab/planx-core/types";
import { object, string } from "yup";

export const defaultValues: TeamTheme = {
  primaryColour: "#0010A4",
  logo: null,
  favicon: null,
  linkColour: "#0010A4",
  actionColour: "#0010A4",
};

export const validationSchema = object({
  primaryColour: string().optional(),
  linkColour: string().optional(),
  actionColour: string().optional(),
  logo: string().nullable(),
  favicon: string().nullable(),
});
