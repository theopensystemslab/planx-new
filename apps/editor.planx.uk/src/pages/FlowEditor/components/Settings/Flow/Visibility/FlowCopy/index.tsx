import PendingActionsIcon from "@mui/icons-material/PendingActions";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { WarningContainer } from "@planx/components/shared/Preview/WarningContainer";
import { useStore } from "pages/FlowEditor/lib/store";
import { Switch } from "ui/shared/Switch";

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
  const [flowId, flowSlug, teamSlug, isTrial] = useStore((state) => [
    state.id,
    state.flowSlug,
    state.teamSlug,
    state.getTeam().settings.isTrial,
  ]);

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
      legend={`${isService ? "Service" : "Flow"} copy permission`}
      description={
        <>
          <p>
            {`Control if this ${isService ? "service" : "flow"} can be used to create new ${isService ? "services" : "flows"} in other teams. It can still be copied and modified within your team.`}
          </p>
          <p>
            <Link
              href={REQUEST_A_REVIEW_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Request a review (opens in a new tab)
            </Link>
            {` by our services team before making this ${isService ? "service" : "flow"} available to copy.`}
          </p>
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
      {({ formik }) => (
        <>
          {isTrial && (
            <WarningContainer>
              <PendingActionsIcon sx={{ mr: 1 }} />
              <Typography variant="body2">
                Trial accounts cannot set flow copy permissions.
              </Typography>
            </WarningContainer>
          )}
          <Switch
            label={
              formik.values.canCreateFromCopy
                ? "Can be copied to create new services"
                : "Cannot be copied to create new services"
            }
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
      )}
    </SettingsFormContainer>
  );
};

export default FlowCopySettings;
