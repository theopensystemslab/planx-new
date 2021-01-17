import type { FindPropertyMerged } from "@planx/components/FindPropertyMerged/model";
import { parseFindPropertyMerged } from "@planx/components/FindPropertyMerged/model";
import { TYPES } from "@planx/components/types";
import {
  EditorProps,
  ICONS,
  InternalNotes,
  MoreInformation,
} from "@planx/components/ui";
import { useFormik } from "formik";
import React from "react";
import ModalSection from "ui/ModalSection";
import ModalSectionContent from "ui/ModalSectionContent";

export type Props = EditorProps<TYPES.FindPropertyMerged, FindPropertyMerged>;

export default FindPropertyMergedComponent;

function FindPropertyMergedComponent(props: Props) {
  const formik = useFormik({
    initialValues: parseFindPropertyMerged(props.node?.data),
    onSubmit: (newValues) => {
      if (props.handleSubmit) {
        props.handleSubmit({ type: TYPES.FindPropertyMerged, data: newValues });
      }
    },
    validate: () => {},
  });
  return (
    <form onSubmit={formik.handleSubmit} id="modal">
      <ModalSection>
        <ModalSectionContent
          title="Find Property"
          Icon={ICONS[TYPES.FindPropertyMerged]}
        >
          <></>
        </ModalSectionContent>
      </ModalSection>
      <MoreInformation
        changeField={formik.handleChange}
        definitionImg={formik.values.definitionImg}
        howMeasured={formik.values.howMeasured}
        policyRef={formik.values.policyRef}
        info={formik.values.info}
      />
      <InternalNotes
        name="notes"
        value={formik.values.notes}
        onChange={formik.handleChange}
      />
    </form>
  );
}
