import { useFormik } from "formik";
import React from "react";
import Input from "ui/Input";
import InputRow from "ui/InputRow";
import ModalSection from "ui/ModalSection";
import ModalSectionContent from "ui/ModalSectionContent";
import RichTextInput from "ui/RichTextInput";

import { TYPES } from "../types";
import { EditorProps, ICONS } from "../ui";
import { Page, parsePage } from "./model";

type Props = EditorProps<TYPES.Page, Page>;

const Component: React.FC<Props> = (props) => {
  const formik = useFormik({
    initialValues: parsePage(props.node?.data),
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

export default Component;
