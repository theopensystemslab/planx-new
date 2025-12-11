import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import type { Content } from "@planx/components/Content/model";
import {
  parseContent,
  validationSchema,
} from "@planx/components/Content/model";
import { EditorProps } from "@planx/components/shared/types";
import { useFormikWithRef } from "@planx/components/shared/useFormikWithRef";
import React from "react";
import ColorPicker from "ui/editor/ColorPicker/ColorPicker";
import { ModalFooter } from "ui/editor/ModalFooter";
import ModalSection from "ui/editor/ModalSection";
import ModalSectionContent from "ui/editor/ModalSectionContent";
import RichTextInput from "ui/editor/RichTextInput/RichTextInput";
import { TemplatedNodeInstructions } from "ui/editor/TemplatedNodeInstructions";
import InputRow from "ui/shared/InputRow";
import { Switch } from "ui/shared/Switch";

import { ICONS } from "../shared/icons";

export type Props = EditorProps<TYPES.Content, Content>;

const ContentComponent: React.FC<Props> = (props) => {
  const formik = useFormikWithRef<Content>(
    {
      initialValues: parseContent(props.node?.data),
      onSubmit: (newValues) => {
        if (props.handleSubmit) {
          props.handleSubmit({ type: TYPES.Content, data: newValues });
        }
      },
      validationSchema,
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
        <ModalSectionContent title="Content" Icon={ICONS[TYPES.Content]}>
          <InputRow>
            <RichTextInput
              placeholder="Content"
              name="content"
              value={formik.values.content}
              onChange={formik.handleChange}
              disabled={props.disabled}
              variant="rootLevelContent"
              errorMessage={formik.errors.content}
            />
          </InputRow>
          <ColorPicker
            inline
            label="Background colour"
            color={formik.values.color}
            onChange={(color) => {
              formik.setFieldValue("color", color);
            }}
            disabled={props.disabled}
            errorMessage={formik.errors.color}
          />
          <InputRow>
            <Switch
              name="resetButton"
              checked={Boolean(formik.values.resetButton)}
              onChange={formik.handleChange}
              label="Reset to start of service"
              disabled={props.disabled}
            />
          </InputRow>
        </ModalSectionContent>
      </ModalSection>
      <ModalFooter formik={formik} disabled={props.disabled} />
    </form>
  );
};

export default ContentComponent;
