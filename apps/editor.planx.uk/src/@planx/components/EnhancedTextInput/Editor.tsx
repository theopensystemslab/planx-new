import FormControl from "@mui/material/FormControl";
import RadioGroup from "@mui/material/RadioGroup";
import { ComponentType } from "@opensystemslab/planx-core/types";
import BasicRadio from "@planx/components/shared/Radio/BasicRadio/BasicRadio";
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

import { DataFieldAutocomplete } from "../shared/DataFieldAutocomplete";
import { ICONS } from "../shared/icons";
import type { EditorProps } from "../shared/types";
import {
  parseEnhancedTextInput,
  taskDefaults,
  TASKS,
  validationSchema,
} from "./model";
import { type EnhancedTextInput, type Task } from "./types";

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
      innerRef={props.formikRef}
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
                <DataFieldAutocomplete
                  required
                  value={formik.values.fn}
                  onChange={(value) => formik.setFieldValue("fn", value)}
                  disabled
                  errorMessage={formik.errors.fn}
                />
              </InputRow>
            </ModalSectionContent>
          </ModalSection>
          <ModalSection>
            <ModalSectionContent title="Enhancement">
              <InputRow>
                <FormControl component="fieldset">
                  <RadioGroup defaultValue="short" value={formik.values.task}>
                    {Object.entries(TASKS).map(([task, { label }]) => (
                      <BasicRadio
                        key={task}
                        id={task}
                        label={label}
                        variant="compact"
                        value={task}
                        onChange={(e) => {
                          formik.setFieldValue("task", e.target);
                          formik.setFieldValue(
                            "fn",
                            taskDefaults[task as Task].fn,
                          );
                        }}
                        disabled={props.disabled}
                      />
                    ))}
                  </RadioGroup>
                </FormControl>
              </InputRow>
            </ModalSectionContent>
          </ModalSection>
          {formik.values.task === "projectDescription" && (
            <ModalSection>
              <ModalSectionContent title="Project description">
                <InputRow>
                  <Input
                    format="large"
                    name="revisionTitle"
                    value={formik.values.revisionTitle}
                    placeholder="Revision title"
                    onChange={formik.handleChange}
                    disabled={props.disabled}
                    errorMessage={formik.errors.revisionTitle}
                  />
                </InputRow>
                <InputRow>
                  <RichTextInput
                    placeholder="Revision description"
                    name="revisionDescription"
                    value={formik.values.revisionDescription}
                    onChange={formik.handleChange}
                    disabled={props.disabled}
                    errorMessage={formik.errors.revisionDescription}
                  />
                </InputRow>
              </ModalSectionContent>
            </ModalSection>
          )}
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
