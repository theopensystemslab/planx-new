import PendingActionsIcon from "@mui/icons-material/PendingActions";
import Link from "@mui/material/Link";
import { useLPS } from "hooks/useLPS";
import { useStore } from "pages/FlowEditor/lib/store";
import { WarningContainer } from "ui/shared/WarningContainer/WarningContainer";

import SettingsFormContainer from "../../../shared/SettingsForm";
import CategorySelection from "./components/CategorySelection";
import ToggleLPS from "./components/ToggleLPS";
import { GET_LPS_LISTING, UPDATE_LPS_LISTING } from "./queries";
import { defaultValues, validationSchema } from "./schema";
import type {
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
          Control whether this service is listed on{" "}
          <Link href={url} target="_blank" rel="noopener noreferrer">
            localplanning.services (opens in a new tab)
          </Link>
          . Listing your service makes it discoverable to applicants and agents
          browsing the services you offer through Plan✕.
        </>
      }
      defaultValues={defaultValues}
      getInitialValues={({ flow }) => ({
        isListedOnLPS: flow.isListedOnLPS,
        summary: flow.summary,
        category: flow.category,
      })}
      queryVariables={{ flowId }}
      getMutationVariables={(values) => ({
        flowId,
        isListedOnLPS: values.isListedOnLPS,
        category: values.category,
      })}
    >
      {({ data }) => {
        const isTrial = data?.flow.team.settings.isTrial;

        return (
          <>
            {isTrial && (
              <WarningContainer icon={PendingActionsIcon}>
                Trial accounts cannot list services on LPS.
              </WarningContainer>
            )}
            <ToggleLPS isTrial={isTrial} />
            <CategorySelection />
          </>
        );
      }}
    </SettingsFormContainer>
  );
};

export default LPSListingSettings;
