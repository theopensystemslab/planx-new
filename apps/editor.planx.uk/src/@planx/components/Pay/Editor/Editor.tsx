import RadioGroup from "@mui/material/RadioGroup";
import Stack from "@mui/material/Stack";
import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import type { Pay, PayMode } from "@planx/components/Pay/model";
import {
  getPayMode,
  parsePay,
  PAY_FN,
  PAY_MODE_OPTIONS,
  validationSchema,
} from "@planx/components/Pay/model";
import BasicRadio from "@planx/components/shared/Radio/BasicRadio/BasicRadio";
import { useFormikWithRef } from "@planx/components/shared/useFormikWithRef";
import { FormikProvider } from "formik";
import { hasFeatureFlag } from "lib/featureFlags";
import { useStore } from "pages/FlowEditor/lib/store";
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

import type { EditorProps } from "../../shared/types";
import { PaymentMetadataSection } from "./PaymentMetadataSection";

export type Props = EditorProps<TYPES.Pay, Pay>;

const Component: React.FC<Props> = (props: Props) => {
  const isTemplate = useStore.getState().isTemplate;

  const formik = useFormikWithRef<Pay>(
    {
      initialValues: parsePay(props.node?.data),
      onSubmit: (newValues) => {
        if (props.handleSubmit) {
          props.handleSubmit({ type: TYPES.Pay, data: newValues });
        }
      },
      validationSchema: validationSchema,
    },
    props.formikRef,
  );

  const payMode = getPayMode(formik.values);

  const payModeOptions = PAY_MODE_OPTIONS.filter(
    ({ value }) => value !== "external" || hasFeatureFlag("EXTERNAL_PAY"),
  );

  const handlePayModeChange: React.ComponentProps<
    typeof BasicRadio
  >["onChange"] = (e) => {
    const newMode = (e.target as HTMLInputElement).value as PayMode;
    if (newMode === payMode) return;

    formik.setValues({
      ...formik.values,
      hidePay: newMode === "informationOnly",
      externalPay: newMode === "external",
      // Invite to pay is only supported when paying within PlanX
      allowInviteToPay:
        newMode === "planx" ? formik.values.allowInviteToPay : false,
    });
  };

  return (
    <FormikProvider value={formik}>
      <form id="modal" name="modal" onSubmit={formik.handleSubmit}>
        <TemplatedNodeInstructions
          isTemplatedNode={formik.values.isTemplatedNode}
          templatedNodeInstructions={formik.values.templatedNodeInstructions}
          areTemplatedNodeInstructionsRequired={
            formik.values.areTemplatedNodeInstructionsRequired
          }
        />
        <ModalSection>
          <ModalSectionContent>
            <InputRow>
              <Input
                format="bold"
                placeholder="Page title"
                name="title"
                value={formik.values.title}
                onChange={formik.handleChange}
                disabled={props.disabled}
                errorMessage={formik.errors.title}
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
                errorMessage={formik.errors.bannerTitle}
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
        </ModalSection>
        <ModalSection>
          <ModalSectionContent title="How will the fee be paid?">
            <Stack spacing={1}>
              <RadioGroup
                value={payMode}
                aria-label="How will the fee be paid?"
              >
                {payModeOptions.map((option) => (
                  <BasicRadio
                    key={option.value}
                    id={option.value}
                    label={option.title}
                    description={option.description}
                    variant="inline"
                    onChange={handlePayModeChange}
                    disabled={props.disabled}
                  />
                ))}
              </RadioGroup>
              {payMode === "planx" && (
                <InputRow>
                  <Switch
                    checked={formik.values.allowInviteToPay}
                    onChange={() =>
                      formik.setFieldValue(
                        "allowInviteToPay",
                        !formik.values.allowInviteToPay,
                      )
                    }
                    label="Allow applicants to invite someone else to pay"
                    disabled={props.disabled}
                    error={formik.errors.allowInviteToPay}
                  />
                </InputRow>
              )}
            </Stack>
          </ModalSectionContent>
          <ModalSectionContent>
            <InputRow>
              <Input
                format="bold"
                placeholder="Instructions title"
                name="instructionsTitle"
                value={formik.values.instructionsTitle}
                onChange={formik.handleChange}
                disabled={props.disabled}
                errorMessage={formik.errors.instructionsTitle}
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
          </ModalSectionContent>
        </ModalSection>
        {payMode !== "informationOnly" && (
          <PaymentMetadataSection disabled={props.disabled} />
        )}
        <MoreInformation formik={formik} disabled={props.disabled} />
        <ComponentTagSelect
          onChange={(value) => formik.setFieldValue("tags", value)}
          value={formik.values.tags}
          disabled={props.disabled}
        />
        <InternalNotes
          name="notes"
          onChange={formik.handleChange}
          value={formik.values.notes}
          disabled={props.disabled}
        />
        {isTemplate && (
          <TemplatedNodeConfiguration
            formik={formik}
            isTemplatedNode={formik.values.isTemplatedNode}
            templatedNodeInstructions={formik.values.templatedNodeInstructions}
            areTemplatedNodeInstructionsRequired={
              formik.values.areTemplatedNodeInstructionsRequired
            }
            disabled={props.disabled}
          />
        )}
      </form>
    </FormikProvider>
  );
};

export default Component;
