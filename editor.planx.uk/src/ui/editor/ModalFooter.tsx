import { BaseNodeData } from "@planx/components/shared";
import { useFormik } from "formik";
import React from "react";
import { InternalNotes } from "ui/editor/InternalNotes";
import { MoreInformation } from "ui/editor/MoreInformation/MoreInformation";

import { ComponentTagSelect } from "./ComponentTagSelect";

interface Props<T extends BaseNodeData> {
  formik: ReturnType<typeof useFormik<T>>;
  showMoreInformation?: boolean;
  showInternalNotes?: boolean;
  showTags?: boolean;
}

export const ModalFooter = <T extends BaseNodeData>({
  formik,
  showMoreInformation = true,
  showInternalNotes = true,
  showTags = true,
}: Props<T>) => (
  <>
    {showMoreInformation && (
      <MoreInformation
        changeField={formik.handleChange}
        definitionImg={formik.values.definitionImg}
        howMeasured={formik.values.howMeasured}
        policyRef={formik.values.policyRef}
        info={formik.values.info}
      />
    )}
    {showInternalNotes && (
      <InternalNotes
        name="notes"
        onChange={formik.handleChange}
        value={formik.values.notes}
      />
    )}
    {showTags && (
      <ComponentTagSelect
        value={formik.values.tags}
        onChange={(value) => formik.setFieldValue("tags", value)}
      />
    )}
  </>
);
