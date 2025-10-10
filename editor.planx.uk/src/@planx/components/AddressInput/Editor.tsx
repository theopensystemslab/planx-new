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

import { DataFieldAutocomplete } from "../shared/DataFieldAutocomplete";
import { ICONS } from "../shared/icons";
import {
  AddressInput,
  editorValidationSchema,
  parseAddressInput,
} from "./model";

export type Props = EditorProps<TYPES.AddressInput, AddressInput>;

const AddressInputComponent: React.FC<Props> = (props) => {
  const formik = useFormik({
    initialValues: parseAddressInput(props.node?.data),
    onSubmit: (newValues) => {
      if (props.handleSubmit) {
        props.handleSubmit({
          type: TYPES.AddressInput,
          data: newValues,
        });
      }
    },
    validationSchema: editorValidationSchema,
    validateOnChange: false,
    validateOnBlur: false,
  });

  return (
    <form onSubmit={formik.handleSubmit} id="modal" name="modal">
      <TemplatedNodeInstructions
        isTemplatedNode={formik.values.isTemplatedNode}
        templatedNodeInstructions={formik.values.templatedNodeInstructions}
        areTemplatedNodeInstructionsRequired={
          formik.values.areTemplatedNodeInstructionsRequired
        }
      />
      <ModalSection>
        <ModalSectionContent
          title="Address input"
          Icon={ICONS[TYPES.AddressInput]}
        >
          <InputRow>
            <Input
              format="large"
              name="title"
              value={formik.values.title}
              placeholder="Title"
              onChange={formik.handleChange}
              disabled={props.disabled}
              errorMessage={formik.errors.title}
            />
          </InputRow>
          <InputRow>
            <RichTextInput
              placeholder="Description"
              name="description"
              value={formik.values.description}
              onChange={formik.handleChange}
              disabled={props.disabled}
              errorMessage={formik.errors.description}
            />
          </InputRow>
          <DataFieldAutocomplete
            data-testid="address-input-data-field"
            required
            value={formik.values.fn}
            onChange={(value) => formik.setFieldValue("fn", value)}
            disabled={props.disabled}
            errorMessage={formik.errors.fn}
          />
        </ModalSectionContent>
      </ModalSection>
      <ModalFooter formik={formik} disabled={props.disabled} />
    </form>
  );
};

export default AddressInputComponent;
