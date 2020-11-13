import { useFormik } from "formik";
import React from "react";

import {
  InternalNotes,
  ModalSection,
  ModalSectionContent,
} from "../../../../ui";
import { parseMoreInformation, TYPES } from "../../data/types";
import { ICONS } from "../shared";
import { MoreInformation } from "./shared";

export interface Props {
  id?: string;
  handleSubmit?: (d: any) => void;
  node?: any;
}

const ContentComponent: React.FC<Props> = (props) => {
  const formik = useFormik({
    initialValues: {
      ...parseMoreInformation(props.node?.data),
    },
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

export default ContentComponent;
