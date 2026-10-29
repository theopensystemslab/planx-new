import Typography from "@mui/material/Typography";
import type { FormikProps } from "formik";
import ModalSection from "ui/editor/ModalSection";
import ModalSectionContent from "ui/editor/ModalSectionContent";
import InputRow from "ui/shared/InputRow";
import { Switch } from "ui/shared/Switch";

import type { ServiceChargeMode } from "../hooks";
import type { SetFee } from "../model";
import { DEFAULT_SERVICE_CHARGE_THRESHOLD, VAT_PERCENTAGE } from "../model";
import type { Props } from "./Editor";

interface ServiceChargeSection {
  formik: FormikProps<SetFee>;
  props: Props;
}

const AutoEnabled: React.FC<ServiceChargeSection> = ({
  formik,
  props: _props,
}) => (
  <ModalSection>
    <ModalSectionContent title="Plan✕ service charge">
      <InputRow>
        <Switch
          checked={true}
          onChange={() => console.log("auto enabled")}
          label="Apply Plan✕ service charge"
          disabled={true}
        />
      </InputRow>
      <Typography variant="body2" sx={{ mb: 2 }}>
        Service charges are automatically enabled based on your payment provider
        (Stripe) and workspace contract.
      </Typography>
      <Typography variant="body2" sx={{ mb: 2 }}>
        A £{formik.values.serviceChargeAmount} service charge plus{" "}
        {VAT_PERCENTAGE * 100}% VAT will be added unless{" "}
        <strong>application.fee.payable</strong> is less than £
        {DEFAULT_SERVICE_CHARGE_THRESHOLD} (after any Fast Track fees,
        exemptions, reductions or increases, inclusive of VAT).
      </Typography>
    </ModalSectionContent>
  </ModalSection>
);

const AutoDisabled: React.FC<ServiceChargeSection> = ({
  formik: _formik,
  props: _props,
}) => (
  <ModalSection>
    <ModalSectionContent title="Plan✕ service charge">
      <InputRow>
        <Switch
          checked={false}
          onChange={() => console.log("auto disabled")}
          label="Apply Plan✕ service charge"
          disabled={true}
        />
      </InputRow>
      <Typography variant="body2" sx={{ mb: 2 }}>
        Service charges are automatically disabled based on your workspace
        contract or a specific flow-level exception.
      </Typography>
    </ModalSectionContent>
  </ModalSection>
);

const Editable: React.FC<ServiceChargeSection> = ({ formik, props }) => (
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
      <Typography variant="body2" sx={{ mb: 2 }}>
        A £{formik.values.serviceChargeAmount} service charge plus{" "}
        {VAT_PERCENTAGE * 100}% VAT will be added unless{" "}
        <strong>application.fee.payable</strong> is less than £
        {DEFAULT_SERVICE_CHARGE_THRESHOLD} (after any Fast Track fees,
        exemptions, reductions or increases, inclusive of VAT).
      </Typography>
      <Typography variant="body2" sx={{ mb: 2 }}>
        Open Systems Lab invoices quarterly to collect the service charge. If
        you'd like to charge a higher fee than £
        {formik.values.serviceChargeAmount}, please contact{" "}
        <a href="mailto:finance@opensystemslab.io" target="_self">
          finance@opensystemslab.io
        </a>
        .
      </Typography>
    </ModalSectionContent>
  </ModalSection>
);

export const SERVICE_CHARGE_SECTION_VARIANTS: Record<
  ServiceChargeMode,
  React.FC<ServiceChargeSection>
> = {
  autoEnable: AutoEnabled,
  autoDisable: AutoDisabled,
  edit: Editable,
};
