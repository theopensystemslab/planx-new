import { useFormik } from "formik";
import React from "react";
import Input from "ui/Input";
import InputRow from "ui/InputRow";
import ModalSection from "ui/ModalSection";
import ModalSectionContent from "ui/ModalSectionContent";
import RichTextInput from "ui/RichTextInput";

import { TYPES } from "../types";
import { EditorProps, ICONS } from "../ui";
import type { Notify } from "./model";
import { parseContent } from "./model";

export type Props = EditorProps<TYPES.Notify, Notify>;

const ContentComponent: React.FC<Props> = (props) => {
  const formik = useFormik<Notify>({
    initialValues: parseContent(props.node?.data),
    onSubmit: (newValues) => {
      if (props.handleSubmit) {
        props.handleSubmit({ type: TYPES.Notify, data: newValues });
      }
    },
    validate: () => {},
  });

  return (
    <form onSubmit={formik.handleSubmit} id="modal">
      <ModalSection>
        <ModalSectionContent title="Notify" Icon={ICONS[TYPES.Notify]}>
          <InputRow>
            <Input
              format="large"
              placeholder="Title"
              name="title"
              value={formik.values.title}
              onChange={formik.handleChange}
            />
          </InputRow>
          <InputRow>
            <RichTextInput
              placeholder="Description"
              name="description"
              value={formik.values.description}
              onChange={formik.handleChange}
            />
          </InputRow>
          <InputRow>
            <Input
              type="url"
              placeholder="url"
              name="url"
              value={formik.values.url}
              onChange={formik.handleChange}
            />
          </InputRow>
        </ModalSectionContent>
      </ModalSection>
    </form>
  );
};

export default ContentComponent;
