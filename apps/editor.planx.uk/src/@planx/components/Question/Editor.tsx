import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import { FormikErrors, FormikValues, useFormik } from "formik";
import React from "react";

import { Option } from "../Option/model";
import BaseQuestionComponent from "../shared/BaseQuestion/Editor";
import { buildChildren } from "../shared/BaseQuestion/model";
import { EditorProps } from "../shared/types";
import {
  parseQuestion,
  Question,
  QuestionWithOptions,
  validationSchema,
} from "./model";

export type Props = EditorProps<
  TYPES.Question,
  Question,
  { options: Option[] }
>;

export const QuestionComponent: React.FC<Props> = (props) => {
  const type = TYPES.Question;

  const formik = useFormik<QuestionWithOptions>({
    initialValues: parseQuestion({
      ...props.node?.data,
      options: props.options,
    }),
    onSubmit: ({ options, ...values }) => {
      const children = buildChildren(options);

      if (props.handleSubmit) {
        props.handleSubmit({ type, data: values }, children);
      } else {
        alert(JSON.stringify({ type, ...values, children }, null, 2));
      }
    },
    validate: ({ options, ...values }) => {
      const errors: FormikErrors<FormikValues> = {};
      if (values.fn && !options.some((option) => option.data.val)) {
        errors.fn = "At least one option must also set a data field";
      }
      if (values.alwaysAutoAnswerBlank && !values.fn) {
        errors.alwaysAutoAnswerBlank =
          "Set a data field for the Question and all options but one when never putting to user";
      }
      if (
        values.alwaysAutoAnswerBlank &&
        values.fn &&
        options.filter((option) => !option.data.val).length !== 1
      ) {
        errors.alwaysAutoAnswerBlank =
          "Exactly one option should have a blank data field when never putting to user";
      }
      return errors;
    },
    validationSchema,
    validateOnChange: false,
    validateOnBlur: false,
  });

  return <BaseQuestionComponent formik={formik} type={type} {...props} />;
};

export default QuestionComponent;
