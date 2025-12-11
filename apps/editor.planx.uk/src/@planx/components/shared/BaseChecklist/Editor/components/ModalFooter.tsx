import { ComponentType } from "@opensystemslab/planx-core/types";
import React from "react";
import { ModalFooter } from "ui/editor/ModalFooter";

import { Props } from "../types";

export const TypeNarrowedModalFooter: React.FC<Props> = ({
  type,
  formik,
  disabled,
}) => {
  if (type === ComponentType.Checklist)
    return <ModalFooter formik={formik} disabled={disabled} />;

  if (type === ComponentType.ResponsiveChecklist)
    return <ModalFooter formik={formik} disabled={disabled} />;
};
