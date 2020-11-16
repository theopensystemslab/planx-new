import { useFormik } from "formik";
import { TYPES } from "planx-nodes/types";
import React from "react";

import {
  Input,
  InputRow,
  ModalSection,
  ModalSectionContent,
  RichTextInput,
} from "../../../../ui";
import { ICONS } from "../shared";

interface Props {
  id?: string;
  handleSubmit?;
  node?: {
    data?: {
      title?: string;
      description?: string;
    };
  };
}

const PageForm: React.FC<Props> = (props) => {
  const formik = useFormik({
    initialValues: {
      title: props.node?.data?.title || "",
      description: props.node?.data?.description || "",
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

export default PageForm;
