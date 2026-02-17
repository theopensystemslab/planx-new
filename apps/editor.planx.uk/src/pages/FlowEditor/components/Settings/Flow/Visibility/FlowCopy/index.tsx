import PendingActionsIcon from "@mui/icons-material/PendingActions";
import Typography from "@mui/material/Typography";
import { WarningContainer } from "@planx/components/shared/Preview/WarningContainer";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { Switch } from "ui/shared/Switch";

import SettingsFormContainer from "../../../shared/SettingsForm";
import { GET_FLOW_VISIBILITY, UPDATE_FLOW_VISIBILITY } from "./queries";
import { defaultValues, validationSchema } from "./schema";
import {
  GetFlowVisibilityData,
  UpdateFlowVisibilityVariables,
  VisibilityFormValues,
} from "./types";

const FlowCopySettings: React.FC = () => {
  const [flowId, isTrial] = useStore((state) => [
    state.id,
    state.getTeam().settings.isTrial,
  ]);

  return (
    <SettingsFormContainer<
      GetFlowVisibilityData,
      UpdateFlowVisibilityVariables,
      VisibilityFormValues
    >
      query={GET_FLOW_VISIBILITY}
      mutation={UPDATE_FLOW_VISIBILITY}
      validationSchema={validationSchema}
      legend={"Flow copy permission"}
      description={
        "Control if this flow can be used to create new services in other teams. The flow can still be copied and modified within your team."
      }
      defaultValues={defaultValues}
      getInitialValues={({ flows: [flow] }) => ({
        canCreateFromCopy: flow.canCreateFromCopy,
      })}
      queryVariables={{ flowId }}
      getMutationVariables={(values) => ({ flowId, ...values })}
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
