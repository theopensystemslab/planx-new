import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
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
import {
  Confirmation,
  parseConfirmation,
  Step,
  validationSchema,
} from "./model";

export type Props = EditorProps<TYPES.Confirmation, Confirmation>;

function NextStepEditor(props: ListManagerEditorProps<Step>) {
  return (
    <Box width="100%">
      <InputRow>
        <Input
          required
          name="title"
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
            required
            name="description"
            value={props.value.description}
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
      </Collapse>
    </Box>
  );
}

export default function ConfirmationEditor(props: Props) {
  const type = TYPES.Confirmation;
  const formik = useFormik<Confirmation>({
    initialValues: parseConfirmation(props.node?.data),
    onSubmit: (values) => {
      if (props.handleSubmit) {
        props.handleSubmit({ type, data: values });
      }
    },
    validationSchema,
    validateOnChange: false,
    validateOnBlur: false,
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
        <ModalSectionContent title="Top banner">
          <InputRow>
            <Input
              placeholder="Heading"
              name="heading"
              value={formik.values.heading}
              onChange={formik.handleChange}
              disabled={props.disabled}
              errorMessage={formik.errors.heading}
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
        </ModalSectionContent>
      </ModalSection>

      <ModalSection>
        <ModalSectionContent title="Next steps" Icon={ICONS[TYPES.TaskList]}>
          <ListManager
            values={formik.values.nextSteps || []}
            onChange={(steps: Step[]) => {
              formik.setFieldValue("nextSteps", steps);
            }}
            Editor={NextStepEditor}
            newValue={() => ({ title: "", description: "" })}
            disabled={props.disabled}
          />
        </ModalSectionContent>
      </ModalSection>

      <ModalSection>
        <ModalSectionContent
          title="More information"
          Icon={ICONS[TYPES.Confirmation]}
        >
          <RichTextInput
            value={formik.values.moreInfo}
            name="moreInfo"
            onChange={formik.handleChange}
            disabled={props.disabled}
            errorMessage={formik.errors.moreInfo}
          />
        </ModalSectionContent>
      </ModalSection>

      <ModalSection>
        <ModalSectionContent title="Contact us" Icon={ICONS[TYPES.Send]}>
          <RichTextInput
            value={formik.values.contactInfo}
            name="contactInfo"
            onChange={formik.handleChange}
            disabled={props.disabled}
            errorMessage={formik.errors.contactInfo}
          />
        </ModalSectionContent>
      </ModalSection>
      <ModalFooter formik={formik} disabled={props.disabled} />
    </form>
  );
}
