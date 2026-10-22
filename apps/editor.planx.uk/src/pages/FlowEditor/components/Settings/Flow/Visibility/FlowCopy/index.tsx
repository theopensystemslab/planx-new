import PendingActionsIcon from "@mui/icons-material/PendingActions";
import Link from "@mui/material/Link";
import { useStore } from "pages/FlowEditor/lib/store";
import { Switch } from "ui/shared/Switch";
import { WarningContainer } from "ui/shared/WarningContainer/WarningContainer";

import { useSlackMessage } from "../../../hooks/useSlackMessage";
import SettingsFormContainer from "../../../shared/SettingsForm";
import { GET_FLOW_VISIBILITY, UPDATE_FLOW_VISIBILITY } from "./queries";
import { defaultValues, validationSchema } from "./schema";
import type {
  GetFlowVisibilityData,
  UpdateFlowVisibilityVariables,
  VisibilityFormValues,
} from "./types";

const REQUEST_A_REVIEW_URL =
  "https://editor.planx.uk/opensystemslab/request-a-review/published";

type Props = { isService: boolean };

const FlowCopySettings: React.FC<Props> = ({ isService }) => {
  const [flowId, flowSlug, teamSlug, isPattern, isSourceTemplate] = useStore(
    (state) => [
      state.id,
      state.flowSlug,
      state.teamSlug,
      state.isPattern,
      state.isTemplate,
    ],
  );

  const flowType = isService ? "service" : "flow";
  const getSwitchLabel = (canCreateFromCopy: boolean) => {
    if (isPattern || isSourceTemplate) {
      return canCreateFromCopy ? "Visible" : "Not visible";
    }
    return canCreateFromCopy
      ? "Can be copied to create new services"
      : "Cannot be copied to create new services";
  };

  const getLegend = () => {
    if (isPattern) return "Pattern visibility";
    if (isSourceTemplate) return "Template visibility";
    return `${isService ? "Service" : "Flow"} copy permission`;
  };

  const getDescription = () => {
    if (isPattern)
      return "Control if this pattern is available to editors, when adding components.";
    if (isSourceTemplate)
      return "Control if this template is available to editors, when creating a new flow from a template.";
    return `Control if this ${flowType} can be used to create new ${flowType}s in other teams. It can still be copied and modified within your team.`;
  };

  const getTrialWarning = () => {
    if (isPattern) return "Trial accounts cannot set pattern visibility.";
    if (isSourceTemplate)
      return "Trial accounts cannot set template visibility.";
    return "Trial accounts cannot set flow copy permissions.";
  };

  const { mutate: sendSlackMessage } = useSlackMessage();

  return (
    <SettingsFormContainer<
      GetFlowVisibilityData,
      UpdateFlowVisibilityVariables,
      VisibilityFormValues
    >
      query={GET_FLOW_VISIBILITY}
      mutation={UPDATE_FLOW_VISIBILITY}
      validationSchema={validationSchema}
      legend={getLegend()}
      description={
        <>
          <p>{getDescription()}</p>
          {!isPattern && !isSourceTemplate && (
            <p>
              <Link
                href={REQUEST_A_REVIEW_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                Request a review (opens in a new tab)
              </Link>
              {` by our services team before making this ${flowType} available to copy.`}
            </p>
          )}
        </>
      }
      defaultValues={defaultValues}
      getInitialValues={({ flows: [flow] }) => ({
        canCreateFromCopy: flow.canCreateFromCopy,
      })}
      queryVariables={{ flowId }}
      getMutationVariables={(values) => ({ flowId, ...values })}
      onSuccess={(data, _formikHelpers, values) => {
        const wasCopyable = data?.flows[0].canCreateFromCopy;
        const hasBeenEnabled = values.canCreateFromCopy && !wasCopyable;
        if (hasBeenEnabled) {
          sendSlackMessage(
            `:unlock: *${teamSlug}/${flowSlug}* can now be copied by other teams`,
          );
        }
      }}
    >
      {({ formik, data }) => {
        const isTrial = data?.flows[0]?.team.settings.isTrial;

        return (
          <>
            {isTrial && (
              <WarningContainer icon={PendingActionsIcon}>
                {getTrialWarning()}
              </WarningContainer>
            )}
            <Switch
              label={getSwitchLabel(formik.values.canCreateFromCopy)}
              name="canCreateFromCopy"
              variant="editorPage"
              checked={formik.values.canCreateFromCopy}
              onChange={() =>
                formik.setFieldValue(
                  "canCreateFromCopy",
                  !formik.values.canCreateFromCopy,
                )
              }
              disabled={isTrial}
            />
          </>
        );
      }}
    </SettingsFormContainer>
  );
};

export default FlowCopySettings;
