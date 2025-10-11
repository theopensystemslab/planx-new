import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import { useFormik } from "formik";
import React from "react";
import { ModalFooter } from "ui/editor/ModalFooter";
import ModalSection from "ui/editor/ModalSection";
import ModalSectionContent from "ui/editor/ModalSectionContent";

import { DataFieldAutocomplete } from "../shared/DataFieldAutocomplete";
import { EditorProps } from "../shared/types";
import { parseResponsiveChecklist, ResponsiveChecklist, validationSchema } from "./model";

type Props = EditorProps<TYPES.ResponsiveChecklist, ResponsiveChecklist>;

export default ResponsiveChecklistComponent;

function ResponsiveChecklistComponent(props: Props) {
  const formik = useFormik({
    initialValues: parseResponsiveChecklist(props.node?.data),
    onSubmit: (newValues) => {
      props.handleSubmit?.({
        type: TYPES.ResponsiveChecklist,
        data: newValues,
      });
    },
    validationSchema,
    validateOnBlur: false,
    validateOnChange: false,
  });

  return (
    <form onSubmit={formik.handleSubmit} id="modal">
      <ModalSection>
        <ModalSectionContent title="Passport field name">
          <DataFieldAutocomplete
            required
            value={formik.values.fn}
            onChange={(value) => formik.setFieldValue("fn", value)}
          />
        </ModalSectionContent>
      </ModalSection>
      <ModalFooter formik={formik} showMoreInformation={false} />
    </form>
  );
}
