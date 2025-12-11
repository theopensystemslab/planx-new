import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import { EditorProps } from "@planx/components/shared/types";
import { useFormikWithRef } from "@planx/components/shared/useFormikWithRef";
import React from "react";
import InputGroup from "ui/editor/InputGroup";
import { ModalFooter } from "ui/editor/ModalFooter";
import ModalSection from "ui/editor/ModalSection";
import ModalSectionContent from "ui/editor/ModalSectionContent";
import RichTextInput from "ui/editor/RichTextInput/RichTextInput";
import { TemplatedNodeInstructions } from "ui/editor/TemplatedNodeInstructions";
import Input from "ui/shared/Input/Input";
import InputRow from "ui/shared/InputRow";
import { Switch } from "ui/shared/Switch";

import { ICONS } from "../shared/icons";
import type { DrawBoundary } from "./model";
import { parseDrawBoundary, validationSchema } from "./model";

export type Props = EditorProps<TYPES.DrawBoundary, DrawBoundary>;

export default DrawBoundaryComponent;

function DrawBoundaryComponent(props: Props) {
  const formik = useFormikWithRef<DrawBoundary>(
    {
      initialValues: parseDrawBoundary(props.node?.data),
      onSubmit: (newValues) => {
        if (props.handleSubmit) {
          props.handleSubmit({ type: TYPES.DrawBoundary, data: newValues });
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
        <ModalSectionContent
          title="Draw boundary"
          Icon={ICONS[TYPES.DrawBoundary]}
        >
          <InputRow>
            <Input
              format="large"
              placeholder={props.node?.data?.title}
              name="title"
              value={formik.values.title}
              onChange={formik.handleChange}
              disabled={props.disabled}
              errorMessage={formik.errors.title}
            />
          </InputRow>
          <InputRow>
            <RichTextInput
              name="description"
              placeholder="Description"
              value={formik.values.description}
              onChange={formik.handleChange}
              disabled={props.disabled}
              errorMessage={formik.errors.description}
            />
          </InputRow>
          <InputGroup label="Data field">
            <InputRow>
              <Input
                name="fn"
                format="data"
                value={formik.values.fn}
                disabled
                errorMessage={formik.errors.fn}
              />
            </InputRow>
          </InputGroup>
        </ModalSectionContent>
        <ModalSectionContent
          title={props.node?.data?.titleForUploading}
          Icon={ICONS[TYPES.DrawBoundary]}
        >
          <InputRow>
            <Input
              format="large"
              placeholder={props.node?.data?.titleForUploading}
              name="titleForUploading"
              value={formik.values.titleForUploading}
              onChange={formik.handleChange}
              disabled={props.disabled}
              errorMessage={formik.errors.titleForUploading}
            />
          </InputRow>
          <InputRow>
            <RichTextInput
              name="descriptionForUploading"
              placeholder="Description"
              value={formik.values.descriptionForUploading}
              onChange={formik.handleChange}
              disabled={props.disabled}
              errorMessage={formik.errors.descriptionForUploading}
            />
          </InputRow>
          <InputRow>
            <Switch
              checked={formik.values.hideFileUpload}
              onChange={() =>
                formik.setFieldValue(
                  "hideFileUpload",
                  !formik.values.hideFileUpload,
                )
              }
              label="Hide file upload and allow user to continue without data"
              disabled={props.disabled}
            />
          </InputRow>
        </ModalSectionContent>
      </ModalSection>
      <ModalFooter formik={formik} disabled={props.disabled} />
    </form>
  );
}
