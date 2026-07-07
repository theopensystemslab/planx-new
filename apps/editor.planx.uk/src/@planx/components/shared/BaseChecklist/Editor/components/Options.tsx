import { ComponentType } from "@opensystemslab/planx-core/types";
import type { ChecklistWithOptions } from "@planx/components/Checklist/model";
import type { ResponsiveChecklistWithOptions } from "@planx/components/ResponsiveChecklist/model";
import React from "react";

import type { Props } from "../types";
import { Options } from "./Options/index";

export const TypeNarrowedOptions: React.FC<Props> = ({
  formik,
  disabled,
  type,
  node,
}) => {
  if (type === ComponentType.Checklist)
    return (
      <Options<ChecklistWithOptions>
        type={type}
        formik={formik}
        disabled={disabled}
        isTemplatedNode={node?.data?.isTemplatedNode}
      />
    );

  if (type === ComponentType.ResponsiveChecklist)
    return (
      <Options<ResponsiveChecklistWithOptions>
        type={type}
        formik={formik}
        disabled={disabled}
        isTemplatedNode={node?.data?.isTemplatedNode}
      />
    );
};
