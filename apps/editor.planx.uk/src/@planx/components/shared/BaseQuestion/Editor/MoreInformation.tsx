import { ComponentType } from "@opensystemslab/planx-core/types";
import React from "react";
import { MoreInformation } from "ui/editor/MoreInformation/MoreInformation";

import { Props } from "./types";

const TypeGuardedMoreInformation: React.FC<Props> = ({
  type,
  formik,
  disabled,
}: Props) => {
  if (type === ComponentType.Question) {
    return <MoreInformation formik={formik} disabled={disabled} />;
  }

  if (type === ComponentType.ResponsiveQuestion) {
    return <MoreInformation formik={formik} disabled={disabled} />;
  }
};

export default TypeGuardedMoreInformation;
