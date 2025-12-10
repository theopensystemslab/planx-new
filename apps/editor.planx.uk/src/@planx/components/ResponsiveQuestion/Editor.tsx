import {
  ComponentType,
  ComponentType as TYPES,
} from "@opensystemslab/planx-core/types";
import { useFormikWithRef } from "@planx/components/shared/useFormikWithRef";
import { FormikErrors, FormikValues } from "formik";
import React from "react";

import { ConditionalOption } from "../Option/model";
import BaseQuestionComponent from "../shared/BaseQuestion/Editor";
import {
  baseQuestionValidationSchema,
  buildChildren,
} from "../shared/BaseQuestion/model";
import { EditorProps } from "../shared/types";
import {
  parseResponsiveQuestion,
  ResponsiveQuestion,
  ResponsiveQuestionWithOptions,
} from "./model";

export type Props = EditorProps<
  TYPES.ResponsiveQuestion,
  ResponsiveQuestion,
  { options: ConditionalOption[] }
>;

export default ResponsiveQuestionComponent;

function ResponsiveQuestionComponent(props: Props) {
  const type = ComponentType.ResponsiveQuestion;

  const formik = useFormikWithRef<ResponsiveQuestionWithOptions>(
    {
      initialValues: parseResponsiveQuestion({
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
        return errors;
      },
      validationSchema: baseQuestionValidationSchema,
    },
    props.formikRef,
  );

  return <BaseQuestionComponent formik={formik} type={type} {...props} />;
}
