import { useFormik } from "formik";
import React from "react";

import {
  InputRow,
  InternalNotes,
  ModalSection,
  ModalSectionContent,
  RichTextInput,
} from "../../../../ui";
import { DateInput, parseDateInput, TYPES } from "../../data/types";
import { ICONS } from "../shared";
import { MoreInformation } from "./shared";

export interface Props {
  id?: string;
  handleSubmit?: (d: any) => void;
  node?: any;
}

const ContentComponent: React.FC<Props> = (props) => {
  const formik = useFormik<DateInput>({
    initialValues: parseDateInput(props.node?.data),
    onSubmit: (newValues) => {
      if (props.handleSubmit) {
        props.handleSubmit({ type: TYPES.DateInput, data: newValues });
      }
    },
    validate: () => {},
  });
  return (
    <form onSubmit={formik.handleSubmit} id="modal">
      <ModalSection>
        <ModalSectionContent title="Date Input" Icon={ICONS[TYPES.Content]}>
          <InputRow>
            <RichTextInput
              placeholder="Title"
              name="title"
              value={formik.values.title}
              onChange={formik.handleChange}
            />
          </InputRow>
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
