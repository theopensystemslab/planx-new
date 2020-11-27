import type { PropertyInformation } from "@planx/components/PropertyInformation/model";
import { parsePropertyInformation } from "@planx/components/PropertyInformation/model";
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

export type Props = EditorProps<TYPES.PropertyInformation, PropertyInformation>;

const PropertyInformationComponent: React.FC<Props> = (props) => {
  const formik = useFormik({
    initialValues: parsePropertyInformation(props.node?.data),
    onSubmit: (newValues) => {
      if (props.handleSubmit) {
        props.handleSubmit({
          type: TYPES.PropertyInformation,
          data: newValues,
        });
      }
    },
    validate: () => {},
  });
  return (
    <form onSubmit={formik.handleSubmit} id="modal">
      <ModalSection>
        <ModalSectionContent
          title="Property Information"
          Icon={ICONS[TYPES.PropertyInformation]}
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

export default PropertyInformationComponent;
