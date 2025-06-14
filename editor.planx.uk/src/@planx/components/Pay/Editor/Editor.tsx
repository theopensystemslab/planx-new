import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import {
  parsePay,
  Pay,
  PAY_FN,
  validationSchema,
} from "@planx/components/Pay/model";
import { Form, Formik } from "formik";
import React from "react";
import { ComponentTagSelect } from "ui/editor/ComponentTagSelect";
import { InternalNotes } from "ui/editor/InternalNotes";
import ModalSection from "ui/editor/ModalSection";
import ModalSectionContent from "ui/editor/ModalSectionContent";
import { MoreInformation } from "ui/editor/MoreInformation/MoreInformation";
import RichTextInput from "ui/editor/RichTextInput/RichTextInput";
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
  const onSubmit = (newValues: Pay) => {
    if (props.handleSubmit) {
      props.handleSubmit({ type: TYPES.Pay, data: newValues });
    }
  };

  return (
    <Formik<Pay>
      initialValues={parsePay(props.node?.data)}
      onSubmit={onSubmit}
      validationSchema={validationSchema}
      validateOnChange={true}
      validateOnBlur={true}
    >
      {({ values, handleChange, setFieldValue }) => (
        <Form id="modal" name="modal">
          <TemplatedNodeInstructions
            isTemplatedNode={values.isTemplatedNode}
            templatedNodeInstructions={values.templatedNodeInstructions}
            areTemplatedNodeInstructionsRequired={
              values.areTemplatedNodeInstructionsRequired
            }
          />
          <ModalSection>
            <ModalSectionContent title="Payment" Icon={ICONS[TYPES.Pay]}>
              <InputRow>
                <Input
                  format="large"
                  placeholder="Page title"
                  name="title"
                  value={values.title}
                  onChange={handleChange}
                  disabled={props.disabled}
                />
              </InputRow>
              <InputRow>
                <Input
                  format="bold"
                  placeholder="Banner title"
                  name="bannerTitle"
                  value={values.bannerTitle}
                  onChange={handleChange}
                  disabled={props.disabled}
                />
              </InputRow>
              <InputRow>
                <RichTextInput
                  placeholder="Banner description"
                  name="description"
                  value={values.description}
                  onChange={handleChange}
                  disabled={props.disabled}
                  variant="nestedContent"
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
                  value={values.instructionsTitle}
                  onChange={handleChange}
                  disabled={props.disabled}
                />
              </InputRow>
              <InputRow>
                <RichTextInput
                  placeholder="Instructions description"
                  name="instructionsDescription"
                  value={values.instructionsDescription}
                  onChange={handleChange}
                  disabled={props.disabled}
                  variant="nestedContent"
                />
              </InputRow>
              <InputRow>
                <Switch
                  checked={values.hidePay}
                  onChange={() => setFieldValue("hidePay", !values.hidePay)}
                  label="Hide the pay buttons and show fee for information only"
                  disabled={props.disabled}
                />
              </InputRow>
            </ModalSectionContent>
          </ModalSection>
          <InviteToPaySection disabled={props.disabled} />
          <GovPayMetadataSection disabled={props.disabled} />
          <MoreInformation
            changeField={handleChange}
            definitionImg={values.definitionImg}
            howMeasured={values.howMeasured}
            policyRef={values.policyRef}
            info={values.info}
            disabled={props.disabled}
          />
          <InternalNotes
            name="notes"
            onChange={handleChange}
            value={values.notes}
            disabled={props.disabled}
          />
          <ComponentTagSelect
            onChange={(value) => setFieldValue("tags", value)}
            value={values.tags}
            disabled={props.disabled}
          />
          {/* isTemplate && (<TemplatedNodeConfiguration
            formik={formik}
            isTemplatedNode={values.isTemplatedNode}
            templatedNodeInstructions={values.templatedNodeInstructions}
            areTemplatedNodeInstructionsRequired={values.areTemplatedNodeInstructionsRequired}
            disabled={props.disabled}
          />) */}
        </Form>
      )}
    </Formik>
  );
};

export default Component;
