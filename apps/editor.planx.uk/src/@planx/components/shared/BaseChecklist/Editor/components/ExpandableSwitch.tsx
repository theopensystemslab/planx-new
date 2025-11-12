import { ComponentType } from "@opensystemslab/planx-core/types";
import { toggleExpandableChecklist } from "@planx/components/shared/BaseChecklist/model";
import React from "react";
import { Switch } from "ui/shared/Switch";

import { Props } from "../types";

export const TypeNarrowedExpandableSwitch: React.FC<Props> = ({
  formik,
  disabled,
  type,
}) => {
  if (type === ComponentType.Checklist)
    return (
      <Switch
        checked={!!formik.values.groupedOptions}
        onChange={() =>
          formik.setValues(toggleExpandableChecklist(formik.values))
        }
        label="Expandable"
        disabled={disabled}
      />
    );

  if (type === ComponentType.ResponsiveChecklist)
    return (
      <Switch
        checked={!!formik.values.groupedOptions}
        onChange={() =>
          formik.setValues(toggleExpandableChecklist(formik.values))
        }
        label="Expandable"
        disabled={disabled}
      />
    );
};
