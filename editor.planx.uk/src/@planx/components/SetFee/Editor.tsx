import Code from "@mui/icons-material/Code";
import Typography from "@mui/material/Typography";
import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import { EditorProps } from "@planx/components/shared/types";
import { useFormik } from "formik";
import { FormattedResponse } from "pages/FlowEditor/components/Submissions/components/FormattedResponse";
import React from "react";
import { ModalFooter } from "ui/editor/ModalFooter";
import ModalSection from "ui/editor/ModalSection";
import ModalSectionContent from "ui/editor/ModalSectionContent";
import Input from "ui/shared/Input/Input";
import InputRow from "ui/shared/InputRow";
import InputRowLabel from "ui/shared/InputRowLabel";
import { Switch } from "ui/shared/Switch";

import { ICONS } from "../shared/icons";
import { parseSetFee, SetFee } from "./model";

type Props = EditorProps<TYPES.SetFee, SetFee>;

export default SetFeeComponent;

function SetFeeComponent(props: Props) {
  const formik = useFormik({
    initialValues: parseSetFee(props.node?.data),
    onSubmit: (newValues) => {
      props.handleSubmit?.({
        type: TYPES.SetFee,
        data: newValues,
      });
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} id="modal">
      <ModalSection>
        <ModalSectionContent
          title="Set service fees"
          Icon={ICONS[TYPES.SetFee]}
        />
      </ModalSection>
      <ModalSection>
        <ModalSectionContent title="Application fee VAT (optional)">
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
            />
          </InputRow>
          <Typography variant="body2">
            If this is a discretionary service, apply 20% VAT to the application
            fee. The incoming <strong>application.fee.calculated</strong> should
            be exclusive of VAT and already reflect the correct development
            category and any exemptions or reductions.
          </Typography>
        </ModalSectionContent>
      </ModalSection>
      <ModalSection>
        <ModalSectionContent title="Fast Track fee (optional)">
          <Typography variant="body2" mb={2}>
            If this service supports Fast Track journeys, specify the fee
            amount. This fee plus 20% VAT will only be applied when{" "}
            <strong>fastTrack.optIn</strong> is "true".
          </Typography>
          <InputRow>
            <InputRowLabel>£</InputRowLabel>
            <Input
              name="fastTrackFeeAmount"
              placeholder="Amount (exclusive of VAT)"
              value={formik.values.fastTrackFeeAmount}
              onChange={formik.handleChange}
            />
          </InputRow>
        </ModalSectionContent>
      </ModalSection>
      <ModalSection>
        <ModalSectionContent title="Plan✕ service charge">
          <Typography variant="body2" mb={2}>
            A £40 service charge plus 20% VAT will only be applied when{" "}
            <strong>application.fee.payable</strong> is greater than £100 (after
            any Fast Track fees, exemptions, or reductions and exclusive of
            VAT).
          </Typography>
          <Typography variant="body2" mb={2}>
            Open Systems Lab invoices quarterly to collect the service charge.
            If you'd like to charge a higher fee than £40, please get in touch
            with [EMAIL].
          </Typography>
        </ModalSectionContent>
      </ModalSection>
      <ModalSection>
        <ModalSectionContent title="Payment processing fee (optional)">
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
            />
          </InputRow>
          <Typography variant="body2" mb={2}>
            If your internal finance team does not wish to absorb Stripe
            transaction fees incurred by GOV.UK Pay for this service, use this
            option to apply an additional 1% of{" "}
            <strong>application.fee.payable</strong> plus 20% VAT payment
            processing fee to the amount owed by the applicant.
          </Typography>
          <Typography variant="body2" mb={2}>
            Please note that it is your responsibility to configure which credit
            card types are accepted in your GOV.UK Pay account. 1% is an average
            processing fee only; American Express and non-EU credit cards are
            likely to have higher rates. If the transaction fee paid is lower
            than 1%, Open Systems Lab will invoice quarterly to collect the
            difference.
          </Typography>
        </ModalSectionContent>
      </ModalSection>
      <ModalSection>
        <ModalSectionContent title="Example" Icon={Code}>
          <Typography variant="body2" mb={2}>
            This example output is based on an incoming{" "}
            <strong>application.fee.calculated</strong> of £200 and your
            selections above.
          </Typography>
          <FormattedResponse
            expandAllLevels
            response={JSON.stringify({
              passport: {
                data: {
                  "application.fee.payable": formik.values.applyCalculatedVAT
                    ? 240
                    : 200,
                  ...(formik.values.applyCalculatedVAT && {
                    "application.fee.payable.VAT": 40,
                  }),
                  "application.fee.calculated": 200,
                  ...(formik.values.applyCalculatedVAT && {
                    "application.fee.calculated.VAT": 40,
                  }),
                },
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
