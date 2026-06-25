import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import { EditorProps } from "@planx/components/shared/types";
import { useFormikWithRef } from "@planx/components/shared/useFormikWithRef";
import React from "react";
import ModalComponentHeader from "ui/editor/ModalComponentHeader";
import { ModalFooter } from "ui/editor/ModalFooter";
import ModalSection from "ui/editor/ModalSection";
import RichTextInput from "ui/editor/RichTextInput/RichTextInput";
import { TemplatedNodeInstructions } from "ui/editor/TemplatedNodeInstructions";
import Input from "ui/shared/Input/Input";
import InputRow from "ui/shared/InputRow";

import { DataFieldAutocomplete } from "../shared/DataFieldAutocomplete";
import {
  AddressInput,
  editorValidationSchema,
  parseAddressInput,
} from "./model";

export type Props = EditorProps<TYPES.AddressInput, AddressInput>;

const AddressInputComponent: React.FC<Props> = (props) => {
  const formik = useFormikWithRef<AddressInput>(
    {
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
    },
    props.formikRef,
  );

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
        <ModalComponentHeader>
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
        </ModalComponentHeader>
      </ModalSection>
      <ModalFooter formik={formik} disabled={props.disabled} />
    </form>
  );
};

export default AddressInputComponent;
