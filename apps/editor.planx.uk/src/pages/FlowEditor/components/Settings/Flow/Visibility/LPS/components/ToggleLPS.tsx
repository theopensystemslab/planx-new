import Link from "@mui/material/Link";
import { useFormikContext } from "formik";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import SettingsDescription from "ui/editor/SettingsDescription";
import { Switch } from "ui/shared/Switch";

import { LPSListingFormValues } from "../types";

const ToggleLPS: React.FC = () => {
  const isTrial = useStore((state) => state.getTeam().settings.isTrial);

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
        disabled={isTrial}
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
