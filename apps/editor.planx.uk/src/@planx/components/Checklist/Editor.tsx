import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import { Option } from "@planx/components/Option/model";
import { BaseChecklistComponent } from "@planx/components/shared/BaseChecklist/Editor";
import {
  FlatOptions,
  GroupedOptions,
} from "@planx/components/shared/BaseChecklist/model";
import { EditorProps } from "@planx/components/shared/types";
import { useFormik } from "formik";
import React from "react";

import {
  ChecklistWithOptions,
  parseChecklist,
  validationSchema,
} from "./model";
import { Checklist } from "./model";

type ExtraProps = FlatOptions<Option> | GroupedOptions<Option>;
export type Props = EditorProps<TYPES.Checklist, Checklist, ExtraProps>;

export const ChecklistEditor: React.FC<Props> = (props) => {
  const type = TYPES.Checklist;

  const formik = useFormik<ChecklistWithOptions>({
    initialValues: parseChecklist({
      ...props.node?.data,
      options: props?.options,
      groupedOptions: props?.groupedOptions,
    }),
    onSubmit: ({ options, groupedOptions, ...values }) => {
      const sourceOptions = options?.length
        ? options
        : groupedOptions?.flatMap((group) => group.children);

      const filteredOptions = (sourceOptions || []).filter(
        (option) => option.data.text,
      );

      const processedOptions = filteredOptions.map((option) => ({
        ...option,
        id: option.id || undefined,
        type: TYPES.Answer as const,
      }));

      if (props.handleSubmit) {
        props.handleSubmit(
          {
            type,
            data: {
              ...values,
              ...(groupedOptions
                ? {
                    categories: groupedOptions.map((group) => ({
                      title: group.title,
                      count: group.children.length,
                    })),
                  }
                : {
                    categories: undefined,
                  }),
            },
          },
          processedOptions,
        );
      } else {
        alert(JSON.stringify({ type, ...values, options }, null, 2));
      }
    },
    validationSchema,
    validateOnBlur: false,
    validateOnChange: false,
  });

  return <BaseChecklistComponent formik={formik} type={type} {...props} />;
};

export default ChecklistEditor;
