import Code from "@mui/icons-material/Code";
import Typography from "@mui/material/Typography";
import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import type { EditorProps } from "@planx/components/shared/types";
import { useFormikWithRef } from "@planx/components/shared/useFormikWithRef";
import { FormattedResponse } from "pages/FlowEditor/components/Submissions/components/FormattedResponse";
import { type Store } from "pages/FlowEditor/lib/store";
import { ModalFooter } from "ui/editor/ModalFooter";
import ModalSection from "ui/editor/ModalSection";
import ModalSectionContent from "ui/editor/ModalSectionContent";
import { TemplatedNodeInstructions } from "ui/editor/TemplatedNodeInstructions";
import ErrorWrapper from "ui/shared/ErrorWrapper";
import Input from "ui/shared/Input/Input";
import InputRow from "ui/shared/InputRow";
import InputRowLabel from "ui/shared/InputRowLabel";
import { Switch } from "ui/shared/Switch";

import { useServiceChargeMode } from "../hooks";
import type { SetFee } from "../model";
import { parseSetFee, validationSchema, VAT_PERCENTAGE } from "../model";
import { handleSetFees } from "../utils";
import { SERVICE_CHARGE_SECTION_VARIANTS } from "./ServiceChargeSection";

export type Props = EditorProps<TYPES.SetFee, SetFee>;

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

  // Conditionally render Service Charges section based on various conditions: payment provider, contract type, flow exceptions
  const serviceChargeMode = useServiceChargeMode();
  const ServiceChargeSection =
    SERVICE_CHARGE_SECTION_VARIANTS[serviceChargeMode];

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
          <Typography variant="body2" sx={{ mb: 2 }}>
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
      <ServiceChargeSection formik={formik} props={props} />
      <ModalSection>
        <ModalSectionContent title="Example" Icon={Code}>
          <Typography variant="body2" sx={{ mb: 2 }}>
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
                  serviceChargeMode: serviceChargeMode,
                }),
              },
            })}
          />
          <Typography variant="body2" sx={{ my: 2 }}>
            <strong>application.fee.payable</strong> is the total sum{" "}
            <em>inclusive of VAT</em> that the applicant will owe when they
            reach Pay. Any of the passport data values above can be referenced
            in your payment metadata.
          </Typography>
        </ModalSectionContent>
      </ModalSection>
      <ModalFooter formik={formik} showMoreInformation={false} />
    </form>
  );
}
