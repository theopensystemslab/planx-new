import { ComponentType } from "@opensystemslab/planx-core/types";
import React from "react";
import { TemplatedNodeConfiguration } from "ui/editor/TemplatedNodeConfiguration";

import { Props } from "./types";

const TypeGuardedTemplatedNodeConfiguration: React.FC<Props> = ({
  type,
  formik,
  disabled,
}: Props) => {
  if (type === ComponentType.Question) {
    return (
      <TemplatedNodeConfiguration
        formik={formik}
        isTemplatedNode={formik.values.isTemplatedNode}
        templatedNodeInstructions={formik.values.templatedNodeInstructions}
        areTemplatedNodeInstructionsRequired={
          formik.values.areTemplatedNodeInstructionsRequired
        }
        disabled={disabled}
      />
    );
  }

  if (type === ComponentType.ResponsiveQuestion) {
    return (
      <TemplatedNodeConfiguration
        formik={formik}
        isTemplatedNode={formik.values.isTemplatedNode}
        templatedNodeInstructions={formik.values.templatedNodeInstructions}
        areTemplatedNodeInstructionsRequired={
          formik.values.areTemplatedNodeInstructionsRequired
        }
        disabled={disabled}
      />
    );
  }
};

export default TypeGuardedTemplatedNodeConfiguration;
