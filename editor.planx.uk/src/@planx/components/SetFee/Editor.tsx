import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import { EditorProps } from "@planx/components/shared/types";
import { useFormik } from "formik";
import React from "react";
import { ModalFooter } from "ui/editor/ModalFooter";
import ModalSection from "ui/editor/ModalSection";
import ModalSectionContent from "ui/editor/ModalSectionContent";
import InputGroup from "ui/editor/InputGroup";

import { DataFieldAutocomplete } from "../shared/DataFieldAutocomplete";
import { ICONS } from "../shared/icons";
import { parseSetFee, SetFee } from "./model";

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
        <ModalSectionContent
          title="Set fee"
          Icon={ICONS[TYPES.SetFee]}
        >
          <InputGroup>
            <DataFieldAutocomplete
              required
              value={formik.values.fn}
              onChange={(value) => formik.setFieldValue("fn", value)}
            />
          </InputGroup>
        </ModalSectionContent>
      </ModalSection>
      <ModalFooter formik={formik} showMoreInformation={false} />
    </form>
  );
}
