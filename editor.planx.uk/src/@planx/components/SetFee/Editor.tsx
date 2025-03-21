import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import { useFormik } from "formik";

import { EditorProps } from "../shared/types";
import { parseSetFee, SetFee } from "./model";
import ModalSection from "ui/editor/ModalSection";
import React from "react";
import ModalSectionContent from "ui/editor/ModalSectionContent";
import { ModalFooter } from "ui/editor/ModalFooter";
import { DataFieldAutocomplete } from "../shared/DataFieldAutocomplete";

type Props = EditorProps<TYPES.SetFee, SetFee>;

export default SetFeeComponent;

function SetFeeComponent(props: Props) {
  const formik = useFormik({
    initialValues: parseSetFee(props.node?.data),
    onSubmit: (newValues) => {
      props.handleSubmit?.({
        type: TYPES.SetFee,
        data: newValues,
      });
    },
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
