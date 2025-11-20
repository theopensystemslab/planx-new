import Link from "@mui/material/Link";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import SettingsDescription from "ui/editor/SettingsDescription";
import { Switch } from "ui/shared/Switch";

import SettingsFormContainer from "../../../shared/SettingsForm";
import { GET_LPS_LISTING, UPDATE_LPS_LISTING } from "./queries";
import { defaultValues, validationSchema } from "./schema";
import {
  GetLPSListingData,
  LPSListingFormValues,
  UpdateLPSListingVariables,
} from "./types";

const LPSListingSettings: React.FC = () => {
  const flowId = useStore((state) => state.id);

  return (
    <SettingsFormContainer<
      GetLPSListingData,
      UpdateLPSListingVariables,
      LPSListingFormValues
    >
      query={GET_LPS_LISTING}
      mutation={UPDATE_LPS_LISTING}
      validationSchema={validationSchema}
      legend={"Local planning services"}
      description={
        <>
          Control if this flow will be listed as a service on{" "}
          <Link
            href="https://localplanning.services"
            target="_blank"
            rel="noopener noreferrer"
          >
            localplanning.services (opens in a new tab)
          </Link>{" "}
          . By listing your service you allow applicants and agents to browse
          the services which you offer via Plan✕.
        </>
      }
      defaultValues={defaultValues}
      getInitialValues={({ flows: [flow] }) => ({
        isListedOnLPS: flow.isListedOnLPS ?? false,
        summary: flow.summary,
      })}
      queryVariables={{ flowId }}
      getMutationVariables={(values) => ({
        flowId,
        isListedOnLPS: values.isListedOnLPS,
      })}
    >
      {({ formik }) => (
        <>
          <Switch
            label={
              formik.values.isListedOnLPS
                ? "Service is listed on localplanning.services"
                : "Service is not listed on localplanning.services"
            }
            name="isListedOnLPS"
            variant="editorPage"
            checked={formik.values.isListedOnLPS}
            onChange={() =>
              formik.setFieldValue(
                "isListedOnLPS",
                !formik.values.isListedOnLPS,
              )
            }
          />
          <SettingsDescription>
            <p>
              Listing your service requires a summary. This can be provided on{" "}
              <Link style={{ whiteSpace: "nowrap" }} href="../about">
                the "About this flow" page
              </Link>
              .
            </p>
          </SettingsDescription>
        </>
      )}
    </SettingsFormContainer>
  );
};

export default LPSListingSettings;
