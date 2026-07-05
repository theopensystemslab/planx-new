import type { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import { ComponentType } from "@opensystemslab/planx-core/types";
import { useFormikWithRef } from "@planx/components/shared/useFormikWithRef";
import React from "react";

import type { ConditionalOption } from "../Option/model";
import { BaseChecklistComponent } from "../shared/BaseChecklist/Editor";
import type {
  FlatOptions,
  GroupedOptions,
} from "../shared/BaseChecklist/model";
import { generatePayload } from "../shared/BaseChecklist/model";
import type { EditorProps } from "../shared/types";
import type { ResponsiveChecklist } from "./model";
import {
  parseResponsiveChecklist,
  type ResponsiveChecklistWithOptions,
  validationSchema,
} from "./model";

type ExtraProps =
  | FlatOptions<ConditionalOption>
  | GroupedOptions<ConditionalOption>;
export type Props = EditorProps<
  TYPES.ResponsiveChecklist,
  ResponsiveChecklist,
  ExtraProps
>;

export default ResponsiveChecklistComponent;

function ResponsiveChecklistComponent(props: Props) {
  const type = ComponentType.ResponsiveChecklist;

  const formik = useFormikWithRef<ResponsiveChecklistWithOptions>(
    {
      initialValues: parseResponsiveChecklist({
        ...props.node?.data,
        options: props?.options,
        groupedOptions: props?.groupedOptions,
      }),
      onSubmit: (values) => {
        const { data, children } = generatePayload(values);

        if (props.handleSubmit) {
          props.handleSubmit({ type, data }, children);
        } else {
          alert(
            JSON.stringify(
              { type, ...values, options: values.options },
              null,
              2,
            ),
          );
        }
      },
      validationSchema,
    },
    props.formikRef,
  );

  return <BaseChecklistComponent formik={formik} type={type} {...props} />;
}
