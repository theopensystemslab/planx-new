import Code from "@mui/icons-material/Code";
import Typography from "@mui/material/Typography";
import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import { EditorProps } from "@planx/components/shared/types";
import { useFormikWithRef } from "@planx/components/shared/useFormikWithRef";
import { FormattedResponse } from "pages/FlowEditor/components/Submissions/components/FormattedResponse";
import { Store } from "pages/FlowEditor/lib/store";
import React from "react";
import { ModalFooter } from "ui/editor/ModalFooter";
import ModalSection from "ui/editor/ModalSection";
import ModalSectionContent from "ui/editor/ModalSectionContent";
import { TemplatedNodeInstructions } from "ui/editor/TemplatedNodeInstructions";
import ErrorWrapper from "ui/shared/ErrorWrapper";
import Input from "ui/shared/Input/Input";
import InputRow from "ui/shared/InputRow";
import InputRowLabel from "ui/shared/InputRowLabel";
import { Switch } from "ui/shared/Switch";

import { ICONS } from "../shared/icons";
import {
  DEFAULT_PAYMENT_PROCESSING_PERCENTAGE,
  DEFAULT_SERVICE_CHARGE_THRESHOLD,
  parseSetFee,
  SetFee,
  validationSchema,
  VAT_PERCENTAGE,
} from "./model";
import { handleSetFees } from "./utils";

type Props = EditorProps<TYPES.SetFee, SetFee>;

export default SetFeeComponent;

const examplePassport: Store.Passport = {
  data: {
    "application.fee.calculated": 200,
    "application.fastTrack": ["true"],
  },
};

function SetFeeComponent(props: Props) {
  const formik = useFormikWithRef<SetFee>(
    {
      initialValues: parseSetFee(props.node?.data),
      onSubmit: (newValues) => {
        props.handleSubmit?.({
          type: TYPES.SetFee,
          data: newValues,
        });
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
        <ModalSectionContent title="Set fees" Icon={ICONS[TYPES.SetFee]} />
      </ModalSection>
      <ModalSection>
        <ModalSectionContent title="Application fee VAT">
          <InputRow>
            <Switch
              checked={formik.values.applyCalculatedVAT}
              onChange={() =>
                formik.setFieldValue(
                  "applyCalculatedVAT",
                  !formik.values.applyCalculatedVAT,
                )
              }
              label="Apply VAT to the application fee"
              disabled={props.disabled}
            />
          </InputRow>
          <Typography variant="body2">
            If this is a discretionary service, apply {VAT_PERCENTAGE * 100}%
            VAT to the application fee. The incoming{" "}
            <strong>application.fee.calculated</strong> should be exclusive of
            VAT and already reflect any exemptions, reductions or increases.
          </Typography>
        </ModalSectionContent>
      </ModalSection>
      <ModalSection>
        <ModalSectionContent title="Fast Track fee">
          <Typography variant="body2" mb={2}>
            If this service supports Fast Track journeys, specify the fee
            amount. This fee plus {VAT_PERCENTAGE * 100}% VAT will be added when{" "}
            <strong>application.fastTrack</strong> applies.
          </Typography>
          <ErrorWrapper error={formik.errors.fastTrackFeeAmount}>
            <InputRow>
              <InputRowLabel>£</InputRowLabel>
              <Input
                name="fastTrackFeeAmount"
                type="number"
                placeholder="Amount (exclusive of VAT)"
                value={
                  formik.values.fastTrackFeeAmount === 0
                    ? ``
                    : formik.values.fastTrackFeeAmount
                } // Show placeholder unless > 0
                onChange={formik.handleChange}
                disabled={props.disabled}
              />
            </InputRow>
          </ErrorWrapper>
        </ModalSectionContent>
      </ModalSection>
      <ModalSection>
        <ModalSectionContent title="Plan✕ service charge">
          <InputRow>
            <Switch
              checked={formik.values.applyServiceCharge}
              onChange={() =>
                formik.setFieldValue(
                  "applyServiceCharge",
                  !formik.values.applyServiceCharge,
                )
              }
              label="Apply Plan✕ service charge"
              disabled={props.disabled}
            />
          </InputRow>
          <Typography variant="body2" mb={2}>
            A £{formik.values.serviceChargeAmount} service charge plus{" "}
            {VAT_PERCENTAGE * 100}% VAT will be added unless{" "}
            <strong>application.fee.payable</strong> is less than £
            {DEFAULT_SERVICE_CHARGE_THRESHOLD} (after any Fast Track fees,
            exemptions, reductions or increases, inclusive of VAT).
          </Typography>
          <Typography variant="body2" mb={2}>
            Open Systems Lab invoices quarterly to collect the service charge.
            If you'd like to charge a higher fee than £
            {formik.values.serviceChargeAmount}, please contact{" "}
            <a href="mailto:finance@opensystemslab.io" target="_self">
              finance@opensystemslab.io
            </a>
            .
          </Typography>
        </ModalSectionContent>
      </ModalSection>
      <ModalSection>
        <ModalSectionContent title="Payment processing fee">
          <InputRow>
            <Switch
              checked={formik.values.applyPaymentProcessingFee}
              onChange={() =>
                formik.setFieldValue(
                  "applyPaymentProcessingFee",
                  !formik.values.applyPaymentProcessingFee,
                )
              }
              label="Put payment processing fee to applicants"
              disabled={props.disabled}
            />
          </InputRow>
          <Typography variant="body2" mb={2}>
            If your council does not wish to absorb Stripe transaction fees
            incurred by GOV.UK Pay for this service, use this option to apply an
            additional {DEFAULT_PAYMENT_PROCESSING_PERCENTAGE * 100}% of{" "}
            <strong>application.fee.payable</strong> plus {VAT_PERCENTAGE * 100}
            % VAT payment processing fee to the amount owed by the applicant.
          </Typography>
          <Typography variant="body2" mb={2}>
            Please note that it is your responsibility to configure which credit
            card types are accepted in your GOV.UK Pay account.{" "}
            {DEFAULT_PAYMENT_PROCESSING_PERCENTAGE * 100}% is an average
            processing fee only; American Express and non-EU credit cards are
            likely to have higher rates.
          </Typography>
        </ModalSectionContent>
      </ModalSection>
      <ModalSection>
        <ModalSectionContent title="Example" Icon={Code}>
          <Typography variant="body2" mb={2}>
            This example output is based on an incoming{" "}
            <strong>application.fee.calculated</strong> of £
            {examplePassport.data?.["application.fee.calculated"]} and your
            selections above.
          </Typography>
          <FormattedResponse
            expandAllLevels
            response={JSON.stringify({
              passport: {
                data: handleSetFees({
                  passport: examplePassport,
                  applyCalculatedVAT: formik.values.applyCalculatedVAT,
                  fastTrackFeeAmount: formik.values.fastTrackFeeAmount,
                  applyServiceCharge: formik.values.applyServiceCharge,
                  applyPaymentProcessingFee:
                    formik.values.applyPaymentProcessingFee,
                }),
              },
            })}
          />
          <Typography variant="body2" my={2}>
            <strong>application.fee.payable</strong> is the total sum{" "}
            <em>inclusive of VAT</em> that the applicant will owe when they
            reach Pay. Any of the passport data values above can be referenced
            in your GOV.UK Pay metadata.
          </Typography>
        </ModalSectionContent>
      </ModalSection>
      <ModalFooter formik={formik} showMoreInformation={false} />
    </form>
  );
}
