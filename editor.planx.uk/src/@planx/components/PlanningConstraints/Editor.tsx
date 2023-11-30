import { TYPES } from "@planx/components/types";
import { EditorProps, ICONS, InternalNotes } from "@planx/components/ui";
import { useFormik } from "formik";
import React from "react";
import Input from "ui/Input";
import InputGroup from "ui/InputGroup";
import InputRow from "ui/InputRow";
import ModalSection from "ui/ModalSection";
import ModalSectionContent from "ui/ModalSectionContent";
import RichTextInput from "ui/RichTextInput";

import { parseContent, PlanningConstraints } from "./model";

type Props = EditorProps<TYPES.PlanningConstraints, PlanningConstraints>;

export default PlanningConstraintsComponent;

function PlanningConstraintsComponent(props: Props) {
  const formik = useFormik({
    initialValues: parseContent(props.node?.data),
    onSubmit: (newValues) => {
      props.handleSubmit?.({
        type: TYPES.PlanningConstraints,
        data: newValues,
      });
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} id="modal">
      <ModalSection>
        <ModalSectionContent
          title="Planning constraints"
          Icon={ICONS[TYPES.PlanningConstraints]}
        >
          <InputRow>
            <Input
              format="large"
              name="title"
              placeholder={formik.values.title}
              value={formik.values.title}
              onChange={formik.handleChange}
            />
          </InputRow>
          <InputRow>
            <RichTextInput
              name="description"
              placeholder="Description"
              value={formik.values.description}
              onChange={formik.handleChange}
            />
          </InputRow>
          <InputGroup label="Planning constraints data field">
            <InputRow>
              <Input
                format="data"
                name="fn"
                placeholder={formik.values.fn}
                value={formik.values.fn}
                onChange={formik.handleChange}
              />
            </InputRow>
          </InputGroup>
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
