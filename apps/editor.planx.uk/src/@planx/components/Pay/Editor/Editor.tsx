import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import {
  parsePay,
  Pay,
  PAY_FN,
  validationSchema,
} from "@planx/components/Pay/model";
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
import { Switch } from "ui/shared/Switch";

import { ICONS } from "../../shared/icons";
import { EditorProps } from "../../shared/types";
import { GovPayMetadataSection } from "./GovPayMetadataSection";
import { InviteToPaySection } from "./InviteToPaySection";

export type Props = EditorProps<TYPES.Pay, Pay>;

const Component: React.FC<Props> = (props: Props) => {
  const isTemplate = useStore.getState().isTemplate;

  const onSubmit = (newValues: Pay) => {
    if (props.handleSubmit) {
      props.handleSubmit({ type: TYPES.Pay, data: newValues });
    }
  };

  return (
    <Formik<Pay>
      innerRef={props.formikRef}
      initialValues={parsePay(props.node?.data)}
      onSubmit={onSubmit}
      validationSchema={validationSchema}
      validateOnBlur={false}
      validateOnChange={false}
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
            <ModalSectionContent title="Payment" Icon={ICONS[TYPES.Pay]}>
              <InputRow>
                <Input
                  format="large"
                  placeholder="Page title"
                  name="title"
                  value={formik.values.title}
                  onChange={formik.handleChange}
                  disabled={props.disabled}
                />
              </InputRow>
              <InputRow>
                <Input
                  format="bold"
                  placeholder="Banner title"
                  name="bannerTitle"
                  value={formik.values.bannerTitle}
                  onChange={formik.handleChange}
                  disabled={props.disabled}
                />
              </InputRow>
              <InputRow>
                <RichTextInput
                  placeholder="Banner description"
                  name="description"
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  disabled={props.disabled}
                  variant="nestedContent"
                  errorMessage={formik.errors.description}
                />
              </InputRow>
              <InputRow>
                <Input format="data" name="fn" value={PAY_FN} disabled />
              </InputRow>
            </ModalSectionContent>
            <ModalSectionContent>
              <InputRow>
                <Input
                  format="large"
                  placeholder="Instructions title"
                  name="instructionsTitle"
                  value={formik.values.instructionsTitle}
                  onChange={formik.handleChange}
                  disabled={props.disabled}
                />
              </InputRow>
              <InputRow>
                <RichTextInput
                  placeholder="Instructions description"
                  name="instructionsDescription"
                  value={formik.values.instructionsDescription}
                  onChange={formik.handleChange}
                  disabled={props.disabled}
                  variant="nestedContent"
                  errorMessage={formik.errors.instructionsDescription}
                />
              </InputRow>
              <InputRow>
                <Switch
                  checked={formik.values.hidePay}
                  onChange={() =>
                    formik.setFieldValue("hidePay", !formik.values.hidePay)
                  }
                  label="Hide the pay buttons and show fee for information only"
                  disabled={props.disabled}
                />
              </InputRow>
            </ModalSectionContent>
          </ModalSection>
          <InviteToPaySection disabled={props.disabled} />
          <GovPayMetadataSection disabled={props.disabled} />
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

export default Component;
