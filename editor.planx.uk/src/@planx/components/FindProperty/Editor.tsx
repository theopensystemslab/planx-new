import {
  FindProperty,
  parseFindProperty,
} from "@planx/components/FindProperty/types";
import { TYPES } from "@planx/components/types";
import { EditorProps, ICONS } from "@planx/components/ui";
import { InternalNotes, MoreInformation } from "@planx/components/ui";
import { useFormik } from "formik";
import React from "react";
import ModalSection from "ui/ModalSection";
import ModalSectionContent from "ui/ModalSectionContent";

export type Props = EditorProps<TYPES.FindProperty, FindProperty>;

const FindPropertyComponent: React.FC<Props> = (props) => {
  const formik = useFormik({
    initialValues: parseFindProperty(props.node?.data),
    onSubmit: (newValues) => {
      if (props.handleSubmit) {
        props.handleSubmit({ type: TYPES.FindProperty, data: newValues });
      }
    },
    validate: () => {},
  });
  return (
    <form onSubmit={formik.handleSubmit} id="modal">
      <ModalSection>
        <ModalSectionContent
          title="Find Property"
          Icon={ICONS[TYPES.FindProperty]}
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
};

export default FindPropertyComponent;
