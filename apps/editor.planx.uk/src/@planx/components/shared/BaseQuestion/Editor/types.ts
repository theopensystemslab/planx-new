import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import { Props as EditorQuestionProps } from "@planx/components/Question/Editor";
import { QuestionWithOptions } from "@planx/components/Question/model";
import { Props as EditorResponsiveQuestionProps } from "@planx/components/ResponsiveQuestion/Editor";
import { ResponsiveQuestionWithOptions } from "@planx/components/ResponsiveQuestion/model";
import { useFormik } from "formik";

export interface QuestionProps extends EditorQuestionProps {
  type: TYPES.Question;
  formik: ReturnType<typeof useFormik<QuestionWithOptions>>;
}

export interface ResponsiveQuestionProps extends EditorResponsiveQuestionProps {
  type: TYPES.ResponsiveQuestion;
  formik: ReturnType<typeof useFormik<ResponsiveQuestionWithOptions>>;
}

export type Props = QuestionProps | ResponsiveQuestionProps;
