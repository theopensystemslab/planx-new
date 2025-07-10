import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import { EditorProps } from "@planx/components/shared/types";
import { useFormik } from "formik";
import React from "react";
import { ModalFooter } from "ui/editor/ModalFooter";
import ModalSection from "ui/editor/ModalSection";
import ModalSectionContent from "ui/editor/ModalSectionContent";
import RichTextInput from "ui/editor/RichTextInput/RichTextInput";
import { TemplatedNodeInstructions } from "ui/editor/TemplatedNodeInstructions";
import Input from "ui/shared/Input/Input";
import InputRow from "ui/shared/InputRow";

import { ICONS } from "../shared/icons";
import { parseSection, Section, validationSchema } from "./model";

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
    validationSchema,
    validateOnBlur: false,
    validateOnChange: false,
  });

  return (
    <form onSubmit={formik.handleSubmit} id="modal">
      <TemplatedNodeInstructions
        isTemplatedNode={formik.values.isTemplatedNode}
        templatedNodeInstructions={formik.values.templatedNodeInstructions}
        areTemplatedNodeInstructionsRequired={
          formik.values.areTemplatedNodeInstructionsRequired
        }
      />
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
              disabled={props.disabled}
            />
          </InputRow>
          <InputRow>
            <RichTextInput
              placeholder="Short section description"
              name="description"
              value={formik.values.description}
              onChange={formik.handleChange}
              disabled={props.disabled}
              variant="paragraphContent"
              errorMessage={formik.errors.description}
            />
          </InputRow>
        </ModalSectionContent>
      </ModalSection>
      <ModalFooter
        formik={formik}
        showMoreInformation={false}
        disabled={props.disabled}
      />
    </form>
  );
}
