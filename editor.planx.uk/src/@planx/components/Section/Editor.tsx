import { TYPES } from "@planx/components/types";
import { EditorProps, ICONS, InternalNotes } from "@planx/components/ui";
import { useFormik } from "formik";
import React from "react";
import ModalSection from "ui/editor/ModalSection";
import ModalSectionContent from "ui/editor/ModalSectionContent";
import RichTextInput from "ui/editor/RichTextInput";
import Input from "ui/shared/Input";
import InputRow from "ui/shared/InputRow";

import { parseSection, Section } from "./model";

type Props = EditorProps<TYPES.Section, Section>;

export default SectionComponent;

function SectionComponent(props: Props) {
  const formik = useFormik({
    initialValues: parseSection(props.node?.data),
    onSubmit: (newValues) => {
      props.handleSubmit?.({
        type: TYPES.Section,
        data: newValues,
      });
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} id="modal">
      <ModalSection>
        <ModalSectionContent title="Section marker" Icon={ICONS[TYPES.Section]}>
          <InputRow>
            <Input
              required
              format="large"
              name="title"
              placeholder="Title"
              value={formik.values.title}
              onChange={formik.handleChange}
            />
          </InputRow>
          <InputRow>
            <RichTextInput
              placeholder="Short section description"
              name="description"
              value={formik.values.description}
              onChange={formik.handleChange}
            />
          </InputRow>
        </ModalSectionContent>
      </ModalSection>
      <InternalNotes
        name="notes"
        value={formik.values.notes}
        onChange={formik.handleChange}
      />
    </form>
  );
}
