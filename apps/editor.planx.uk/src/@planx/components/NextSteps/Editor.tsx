import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import type { NextSteps, Step } from "@planx/components/NextSteps/model";
import {
  parseNextSteps,
  validationSchema,
} from "@planx/components/NextSteps/model";
import { EditorProps } from "@planx/components/shared/types";
import { useFormik } from "formik";
import React, { ChangeEvent } from "react";
import ListManager, {
  EditorProps as ListManagerEditorProps,
} from "ui/editor/ListManager/ListManager";
import { ModalFooter } from "ui/editor/ModalFooter";
import ModalSection from "ui/editor/ModalSection";
import ModalSectionContent from "ui/editor/ModalSectionContent";
import RichTextInput from "ui/editor/RichTextInput/RichTextInput";
import { TemplatedNodeInstructions } from "ui/editor/TemplatedNodeInstructions";
import Input from "ui/shared/Input/Input";
import InputRow from "ui/shared/InputRow";

import { ICONS } from "../shared/icons";

type Props = EditorProps<TYPES.NextSteps, NextSteps>;

const newStep = (): Step => ({
  title: "",
  description: "",
  url: "",
});

const TaskEditor: React.FC<ListManagerEditorProps<Step>> = (props) => {
  return (
    <Box sx={{ flex: 1 }}>
      <InputRow>
        <Input
          required
          name="title"
          multiline
          value={props.value.title}
          onChange={(ev: ChangeEvent<HTMLInputElement>) => {
            props.onChange({
              ...props.value,
              title: ev.target.value,
            });
          }}
          placeholder="Title"
          disabled={props.disabled}
        />
      </InputRow>
      <Collapse in={!props.isCollapsed} timeout="auto">
        <InputRow>
          <Input
            name="description"
            value={props.value.description || ""}
            multiline
            onChange={(ev: ChangeEvent<HTMLInputElement>) => {
              props.onChange({
                ...props.value,
                description: ev.target.value,
              });
            }}
            placeholder="Description"
            disabled={props.disabled}
          />
        </InputRow>
        <InputRow>
          <Input
            name="url"
            type="url"
            value={props.value.url || ""}
            onChange={(ev: ChangeEvent<HTMLInputElement>) => {
              props.onChange({
                ...props.value,
                url: ev.target.value,
              });
            }}
            placeholder="url"
            disabled={props.disabled}
          />
        </InputRow>
      </Collapse>
    </Box>
  );
};

const NextStepsComponent: React.FC<Props> = (props) => {
  const formik = useFormik({
    initialValues: parseNextSteps(props.node?.data),
    onSubmit: (newValues) => {
      if (props.handleSubmit) {
        props.handleSubmit({ type: TYPES.NextSteps, data: newValues });
      }
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
        <ModalSectionContent title="Next steps" Icon={ICONS[TYPES.NextSteps]}>
          <Box mb="1rem">
            <InputRow>
              <Input
                name="title"
                value={formik.values.title}
                onChange={formik.handleChange}
                placeholder="Main Title"
                format="large"
                disabled={props.disabled}
                errorMessage={formik.errors.title}
              />
            </InputRow>
            <InputRow>
              <RichTextInput
                name="description"
                value={formik.values.description}
                onChange={formik.handleChange}
                placeholder="Main Description"
                disabled={props.disabled}
                errorMessage={formik.errors.description}
              />
            </InputRow>
          </Box>
          <ListManager
            values={formik.values.steps}
            onChange={(steps: Array<Step>) => {
              formik.setFieldValue("steps", steps);
            }}
            Editor={TaskEditor}
            newValue={newStep}
            disabled={props.disabled}
          />
        </ModalSectionContent>
      </ModalSection>
      <ModalFooter formik={formik} disabled={props.disabled} />
    </form>
  );
};

export default NextStepsComponent;
