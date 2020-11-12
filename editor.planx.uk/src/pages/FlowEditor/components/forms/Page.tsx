import { useFormik } from "formik";
import React from "react";

import {
  InputRow,
  ModalSection,
  ModalSectionContent,
  RichTextInput,
} from "../../../../ui";
import { TYPES } from "../../data/types";
import { ICONS } from "../shared";

interface Props {
  id?: string;
  handleSubmit?;
  node?: any;
}

const PageForm: React.FC<Props> = (props) => {
  const formik = useFormik({
    initialValues: {
      title: props.node?.data?.title || "",
    },
    onSubmit: (values) => {
      if (props.handleSubmit) {
        props.handleSubmit({ type: TYPES.Page, data: values });
      } else {
        alert(JSON.stringify(values, null, 2));
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} id="modal">
      <ModalSection>
        <ModalSectionContent title="Page" Icon={ICONS[TYPES.Page]}>
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
    </form>
  );
};

export default PageForm;
