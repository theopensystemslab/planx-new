import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import type { NumberInput } from "@planx/components/NumberInput/model";
import {
  editorValidationSchema,
  parseNumberInput,
} from "@planx/components/NumberInput/model";
import { EditorProps } from "@planx/components/shared/types";
import { useFormikWithRef } from "@planx/components/shared/useFormikWithRef";
import React from "react";
import { ModalFooter } from "ui/editor/ModalFooter";
import ModalSection from "ui/editor/ModalSection";
import ModalSectionContent from "ui/editor/ModalSectionContent";
import RichTextInput from "ui/editor/RichTextInput/RichTextInput";
import { TemplatedNodeInstructions } from "ui/editor/TemplatedNodeInstructions";
import Input from "ui/shared/Input/Input";
import InputRow from "ui/shared/InputRow";
import InputRowItem from "ui/shared/InputRowItem";
import InputRowLabel from "ui/shared/InputRowLabel";
import { Switch } from "ui/shared/Switch";

import { DataFieldAutocomplete } from "../shared/DataFieldAutocomplete";
import { ICONS } from "../shared/icons";

export type Props = EditorProps<TYPES.NumberInput, NumberInput>;

export default function NumberInputComponent(props: Props): FCReturn {
  const formik = useFormikWithRef<NumberInput>(
    {
      initialValues: parseNumberInput(props.node?.data),
      onSubmit: (newValues) => {
        if (props.handleSubmit) {
          props.handleSubmit({ type: TYPES.NumberInput, data: newValues });
        }
      },
      validationSchema: editorValidationSchema,
    },
    props.formikRef,
  );

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
        <ModalSectionContent
          title="Number input"
          Icon={ICONS[TYPES.NumberInput]}
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
            value={formik.values.fn}
            onChange={(value) => formik.setFieldValue("fn", value)}
            disabled={props.disabled}
            errorMessage={formik.errors.fn}
          />
          <InputRow>
            <InputRowLabel>units</InputRowLabel>
            <InputRowItem>
              <Input
                name="units"
                value={formik.values.units}
                placeholder="eg square metres"
                onChange={formik.handleChange}
                disabled={props.disabled}
                errorMessage={formik.errors.units}
              />
            </InputRowItem>
          </InputRow>
          <InputRow>
            <Switch
              checked={formik.values.allowNegatives}
              onChange={() =>
                formik.setFieldValue(
                  "allowNegatives",
                  !formik.values.allowNegatives,
                )
              }
              label="Allow negative numbers to be input"
              disabled={props.disabled}
            />
          </InputRow>
          <InputRow>
            <Switch
              checked={formik.values.isInteger}
              onChange={() =>
                formik.setFieldValue("isInteger", !formik.values.isInteger)
              }
              label="Only allow whole numbers"
              disabled={props.disabled}
            />
          </InputRow>
        </ModalSectionContent>
      </ModalSection>
      <ModalFooter formik={formik} disabled={props.disabled} />
    </form>
  );
}
