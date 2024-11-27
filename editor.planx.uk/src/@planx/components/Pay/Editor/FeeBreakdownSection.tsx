import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import { useFormikContext } from "formik";
import { hasFeatureFlag } from "lib/featureFlags";
import React from "react";
import ModalSection from "ui/editor/ModalSection";
import ModalSectionContent from "ui/editor/ModalSectionContent";
import InputRow from "ui/shared/InputRow";
import { Switch } from "ui/shared/Switch";

import { Pay } from "../model";

export const FeeBreakdownSection: React.FC = () => {
  const { values, setFieldValue } = useFormikContext<Pay>();

  if (!hasFeatureFlag("FEE_BREAKDOWN")) return null;

  return (
    <ModalSection>
      <ModalSectionContent title="Fee breakdown" Icon={ReceiptLongIcon}>
        <InputRow>
          <Switch
            checked={values.showFeeBreakdown}
            onChange={() =>
              setFieldValue("showFeeBreakdown", !values.showFeeBreakdown)
            }
            label="Display a breakdown of the fee to the applicant"
          />
        </InputRow>
      </ModalSectionContent>
    </ModalSection>
  );
};
