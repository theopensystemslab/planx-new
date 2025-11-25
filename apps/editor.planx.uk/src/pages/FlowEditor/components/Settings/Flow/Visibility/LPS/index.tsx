import Link from "@mui/material/Link";
import { useLPS } from "hooks/useLPS";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";

import SettingsFormContainer from "../../../shared/SettingsForm";
import CategorySelection from "./components/CategorySelection";
import ToggleLPS from "./components/ToggleLPS";
import { GET_LPS_LISTING, UPDATE_LPS_LISTING } from "./queries";
import { defaultValues, validationSchema } from "./schema";
import {
  GetLPSListingData,
  LPSListingFormValues,
  UpdateLPSListingVariables,
} from "./types";

const LPSListingSettings: React.FC = () => {
  const flowId = useStore((state) => state.id);
  const { url } = useLPS();

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
          <Link href={url} target="_blank" rel="noopener noreferrer">
            localplanning.services (opens in a new tab)
          </Link>{" "}
          . By listing your service you allow applicants and agents to browse
          the services which you offer via Plan✕.
        </>
      }
      defaultValues={defaultValues}
      getInitialValues={({ flow }) => flow}
      queryVariables={{ flowId }}
      getMutationVariables={(values) => ({
        flowId,
        isListedOnLPS: values.isListedOnLPS,
        category: values.category,
      })}
    >
      {() => (
        <>
          <ToggleLPS />
          <CategorySelection />
        </>
      )}
    </SettingsFormContainer>
  );
};

export default LPSListingSettings;
