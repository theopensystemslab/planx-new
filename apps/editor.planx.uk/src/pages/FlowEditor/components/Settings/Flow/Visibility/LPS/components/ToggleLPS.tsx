import Link from "@mui/material/Link";
import { useFormikContext } from "formik";
import React from "react";
import SettingsDescription from "ui/editor/SettingsDescription";
import { Switch } from "ui/shared/Switch";

import { LPSListingFormValues } from "../types";

const ToggleLPS: React.FC = () => {
  const { values, errors, setFieldValue } =
    useFormikContext<LPSListingFormValues>();

  return (
    <>
      <Switch
        error={errors?.isListedOnLPS}
        label={
          values.isListedOnLPS
            ? "Service is listed on localplanning.services"
            : "Service is not listed on localplanning.services"
        }
        name="isListedOnLPS"
        variant="editorPage"
        checked={values.isListedOnLPS}
        onChange={() => setFieldValue("isListedOnLPS", !values.isListedOnLPS)}
      />
      <SettingsDescription>
        <p>
          Listing your service requires a summary. This can be provided on{" "}
          <Link style={{ whiteSpace: "nowrap" }} href="../settings/about">
            the "About this flow" page
          </Link>
          .
        </p>
      </SettingsDescription>
    </>
  );
};

export default ToggleLPS;
