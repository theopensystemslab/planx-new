import type { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import type { Props as EditorQuestionProps } from "@planx/components/Question/Editor";
import type { QuestionWithOptions } from "@planx/components/Question/model";
import type { Props as EditorResponsiveQuestionProps } from "@planx/components/ResponsiveQuestion/Editor";
import type { ResponsiveQuestionWithOptions } from "@planx/components/ResponsiveQuestion/model";
import type { useFormik } from "formik";

export interface QuestionProps extends EditorQuestionProps {
  type: TYPES.Question;
  formik: ReturnType<typeof useFormik<QuestionWithOptions>>;
}

export interface ResponsiveQuestionProps extends EditorResponsiveQuestionProps {
  type: TYPES.ResponsiveQuestion;
  formik: ReturnType<typeof useFormik<ResponsiveQuestionWithOptions>>;
}

export type Props = QuestionProps | ResponsiveQuestionProps;
