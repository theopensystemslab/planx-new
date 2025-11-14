import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { Link } from "react-navi";
import SettingsDescription from "ui/editor/SettingsDescription";
import { Switch } from "ui/shared/Switch";

import SettingsFormContainer from "../../../shared/SettingsForm";
import { GET_LPS_LISTING, UPDATE_LPS_LISTING } from "./queries";
import { validationSchema } from "./schema";
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
      legend={"Listings"}
      description={"Manage how this service is listed and indexed"}
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
              Control if this service will be listed on{" "}
              <a
                href="https://www.localplanning.services"
                target="_blank"
                rel="noopener noreferrer"
              >
                localplanning.services (opens in a new tab)
              </a>
              . By listing your service you allow applicants and agents to
              browse the services which you offer via PlanX.
            </p>
            <p>
              Listing your service requires a summary. This can be provided on{" "}
              <Link href="../about">the "About this flow" page</Link>.
            </p>
          </SettingsDescription>
        </>
      )}
    </SettingsFormContainer>
  );
};

export default LPSListingSettings;
