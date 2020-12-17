import { useFormik } from "formik";
import React from "react";
import Input from "ui/Input";
import InputRow from "ui/InputRow";
import ModalSection from "ui/ModalSection";
import ModalSectionContent from "ui/ModalSectionContent";
import RichTextInput from "ui/RichTextInput";

import { TYPES } from "../types";
import { EditorProps, ICONS } from "../ui";
import { PageWithSections } from "./model";

type Props = EditorProps<TYPES.PageWithSections, PageWithSections>;

const Form: React.FC<Props> = (props) => {
  const formik = useFormik({
    initialValues: {
      title: props.node?.data?.title || "",
      description: props.node?.data?.description || "",
    },
    onSubmit: (values) => {
      if (props.handleSubmit) {
        props.handleSubmit({ type: TYPES.PageWithSections, data: values });
      } else {
        alert(JSON.stringify(values, null, 2));
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} id="modal">
      <ModalSection>
        <ModalSectionContent
          title="Page with sections"
          Icon={ICONS[TYPES.PageWithSections]}
        >
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
    </form>
  );
};

export default Form;
