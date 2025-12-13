import MenuItem from "@mui/material/MenuItem";
import { ComponentType } from "@opensystemslab/planx-core/types";
import { Form, Formik } from "formik";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { ComponentTagSelect } from "ui/editor/ComponentTagSelect";
import { InternalNotes } from "ui/editor/InternalNotes";
import ModalSection from "ui/editor/ModalSection";
import ModalSectionContent from "ui/editor/ModalSectionContent";
import { MoreInformation } from "ui/editor/MoreInformation/MoreInformation";
import RichTextInput from "ui/editor/RichTextInput/RichTextInput";
import { TemplatedNodeConfiguration } from "ui/editor/TemplatedNodeConfiguration";
import { TemplatedNodeInstructions } from "ui/editor/TemplatedNodeInstructions";
import Input from "ui/shared/Input/Input";
import InputRow from "ui/shared/InputRow";
import InputRowItem from "ui/shared/InputRowItem";
import InputRowLabel from "ui/shared/InputRowLabel";
import SelectInput from "ui/shared/SelectInput/SelectInput";

import { ICONS } from "../shared/icons";
import type { EditorProps } from "../shared/types";
import { parseEnhancedTextInput, TASKS, validationSchema } from "./model";
import { type EnhancedTextInput } from "./types";

type Props = EditorProps<ComponentType.EnhancedTextInput, EnhancedTextInput>;

const EnhancedTextInputComponent = (props: Props) => {
  const isTemplate = useStore((state) => state.isTemplate);
  const initialValues = parseEnhancedTextInput(props.node?.data);

  const onSubmit = (data: EnhancedTextInput) => {
    if (props.handleSubmit) {
      props.handleSubmit({ type: ComponentType.EnhancedTextInput, data });
    }
  };

  return (
    <Formik<EnhancedTextInput>
      initialValues={initialValues}
      onSubmit={onSubmit}
      validationSchema={validationSchema}
      validateOnChange={false}
      validateOnBlur={false}
    >
      {(formik) => (
        <Form id="modal" name="modal">
          <TemplatedNodeInstructions
            isTemplatedNode={formik.values.isTemplatedNode}
            templatedNodeInstructions={formik.values.templatedNodeInstructions}
            areTemplatedNodeInstructionsRequired={
              formik.values.areTemplatedNodeInstructionsRequired
            }
          />
          <ModalSection>
            <ModalSectionContent
              title="Enhanced Text Input"
              Icon={ICONS[ComponentType.EnhancedTextInput]}
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
              <InputRow>
                <InputRowLabel>Task</InputRowLabel>
                <InputRowItem>
                  <SelectInput
                    value={formik.values.task}
                    disabled={props.disabled}
                    onChange={(e) => {
                      formik.setFieldValue("task", e.target.value);
                      console.log({ errors: formik.errors });
                    }}
                  >
                    {Object.entries(TASKS).map(([task, { label }]) => (
                      <MenuItem key={task} value={task}>
                        {label}
                      </MenuItem>
                    ))}
                  </SelectInput>
                </InputRowItem>
              </InputRow>
            </ModalSectionContent>
          </ModalSection>
          <MoreInformation formik={formik} disabled={props.disabled} />
          <InternalNotes
            name="notes"
            onChange={formik.handleChange}
            value={formik.values.notes}
            disabled={props.disabled}
          />
          <ComponentTagSelect
            onChange={(value) => formik.setFieldValue("tags", value)}
            value={formik.values.tags}
            disabled={props.disabled}
          />
          {isTemplate && (
            <TemplatedNodeConfiguration
              formik={formik}
              isTemplatedNode={formik.values.isTemplatedNode}
              templatedNodeInstructions={
                formik.values.templatedNodeInstructions
              }
              areTemplatedNodeInstructionsRequired={
                formik.values.areTemplatedNodeInstructionsRequired
              }
              disabled={props.disabled}
            />
          )}
        </Form>
      )}
    </Formik>
  );
};

export default EnhancedTextInputComponent;