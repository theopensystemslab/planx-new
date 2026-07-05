import type { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import type { Props as EditorChecklistProps } from "@planx/components/Checklist/Editor";
import type { ChecklistWithOptions } from "@planx/components/Checklist/model";
import type { Props as EditorResponsiveChecklistProps } from "@planx/components/ResponsiveChecklist/Editor";
import type { ResponsiveChecklistWithOptions } from "@planx/components/ResponsiveChecklist/model";
import type { useFormik } from "formik";

export type ChecklistProps = {
  type: TYPES.Checklist;
  formik: ReturnType<typeof useFormik<ChecklistWithOptions>>;
} & EditorChecklistProps;

export type ResponsiveChecklistProps = {
  type: TYPES.ResponsiveChecklist;
  formik: ReturnType<typeof useFormik<ResponsiveChecklistWithOptions>>;
} & EditorResponsiveChecklistProps;

export type Props = ChecklistProps | ResponsiveChecklistProps;
