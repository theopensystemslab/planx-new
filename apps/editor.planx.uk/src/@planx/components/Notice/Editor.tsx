import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import type { Notice } from "@planx/components/Notice/model";
import { parseNotice, validationSchema } from "@planx/components/Notice/model";
import { useFormikWithRef } from "@planx/components/shared/useFormikWithRef";
import { useFormik } from "formik";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import ColorPicker from "ui/editor/ColorPicker/ColorPicker";
import { ComponentTagSelect } from "ui/editor/ComponentTagSelect";
import ModalSection from "ui/editor/ModalSection";
import ModalSectionContent from "ui/editor/ModalSectionContent";
import RichTextInput from "ui/editor/RichTextInput/RichTextInput";
import { TemplatedNodeConfiguration } from "ui/editor/TemplatedNodeConfiguration";
import { TemplatedNodeInstructions } from "ui/editor/TemplatedNodeInstructions";
import Input from "ui/shared/Input/Input";
import InputRow from "ui/shared/InputRow";
import { Switch } from "ui/shared/Switch";

import { InternalNotes } from "../../../ui/editor/InternalNotes";
import { MoreInformation } from "../../../ui/editor/MoreInformation/MoreInformation";
import { ICONS } from "../shared/icons";
import { EditorProps } from "../shared/types";

export type Props = EditorProps<TYPES.Notice, Notice>;

export interface NoticeEditorProps {
  formik: ReturnType<typeof useFormik<Notice>>;
  disabled?: boolean;
}

const NoticeEditor: React.FC<NoticeEditorProps> = ({ formik, disabled }) => {
  const isTemplate = useStore.getState().isTemplate;

  const { values, handleChange, setFieldValue } = formik;

  return (
    <>
      <TemplatedNodeInstructions
        isTemplatedNode={values.isTemplatedNode}
        templatedNodeInstructions={values.templatedNodeInstructions}
        areTemplatedNodeInstructionsRequired={
          values.areTemplatedNodeInstructionsRequired
        }
      />
      <ModalSection>
        <ModalSectionContent title="Notice" Icon={ICONS[TYPES.Notice]}>
          <InputRow>
            <Input
              name="title"
              format="large"
              placeholder="Notice"
              value={values.title}
              onChange={handleChange}
              disabled={disabled}
            />
          </InputRow>
          <InputRow>
            <RichTextInput
              name="description"
              placeholder="Description"
              value={values.description}
              onChange={handleChange}
              disabled={disabled}
              errorMessage={formik.errors.description}
            />
          </InputRow>
          <ColorPicker
            inline
            label="Background colour"
            color={values.color}
            onChange={(color) => {
              setFieldValue("color", color);
            }}
            disabled={disabled}
          />
          <InputRow>
            <Switch
              name="resetButton"
              checked={Boolean(values.resetButton)}
              onChange={handleChange}
              label="Reset to start of service"
              disabled={disabled}
            />
          </InputRow>
        </ModalSectionContent>
      </ModalSection>
      <MoreInformation formik={formik} disabled={disabled} />
      <InternalNotes
        name="notes"
        onChange={handleChange}
        value={values.notes}
        disabled={disabled}
      />
      <ComponentTagSelect
        onChange={(value) => formik.setFieldValue("tags", value)}
        value={values.tags}
        disabled={disabled}
      />
      {isTemplate && (
        <TemplatedNodeConfiguration
          formik={formik}
          isTemplatedNode={values.isTemplatedNode}
          templatedNodeInstructions={values.templatedNodeInstructions}
          areTemplatedNodeInstructionsRequired={
            values.areTemplatedNodeInstructionsRequired
          }
          disabled={disabled}
        />
      )}
    </>
  );
};

const NoticeComponent: React.FC<Props> = (props) => {
  const formik = useFormikWithRef<Notice>(
    {
      initialValues: parseNotice(props.node?.data),
      onSubmit: (newValues) => {
        if (props.handleSubmit) {
          props.handleSubmit({ type: TYPES.Notice, data: newValues });
        }
      },
      validationSchema,
    },
    props.formikRef,
  );

  return (
    <form onSubmit={formik.handleSubmit} id="modal">
      <NoticeEditor formik={formik} disabled={props.disabled} />
    </form>
  );
};

export default NoticeComponent;
