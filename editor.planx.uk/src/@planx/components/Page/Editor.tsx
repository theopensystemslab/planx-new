import { TYPES } from "@planx/components/types";
import {
  EditorProps,
  ICONS,
  InternalNotes,
  MoreInformation,
} from "@planx/components/ui";
import { useFormik } from "formik";
import React from "react";
import Input from "ui/Input";
import InputRow from "ui/InputRow";
import ModalSection from "ui/ModalSection";
import ModalSectionContent from "ui/ModalSectionContent";
import RichTextInput from "ui/RichTextInput";

import { Page, parsePage } from "./model";

export type Props = EditorProps<TYPES.Page, Page>;

const PageForm: React.FC<Props> = (props) => {
  const formik = useFormik({
    initialValues: parsePage(props.node?.data),
    onSubmit: (newValues) => {
      if (props.handleSubmit) {
        props.handleSubmit({ type: TYPES.Page, data: newValues });
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} id="modal">
      <ModalSection>
        <ModalSectionContent title="Page" Icon={ICONS[TYPES.Page]}>
          <InputRow>
            <Input
              format="large"
              name="title"
              onChange={formik.handleChange}
              placeholder="Title"
              value={formik.values.title}
            />
          </InputRow>
          <InputRow>
            <RichTextInput
              name="description"
              onChange={formik.handleChange}
              placeholder="Description"
              value={formik.values.description}
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

export default PageForm;
