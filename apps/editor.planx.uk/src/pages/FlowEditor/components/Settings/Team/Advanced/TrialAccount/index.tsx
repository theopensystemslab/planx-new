import Box from "@mui/material/Box";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { Switch } from "ui/shared/Switch";

import SettingsFormContainer from "../../../shared/SettingsForm";
import { GET_TEAM_SETTINGS, UPDATE_TEAM_SETTINGS } from "./queries";
import { defaultValues, validationSchema } from "./schema";
import {
  GetTeamSettingsData,
  TrialAccountFormValues,
  UpdateTeamSettingsVariables,
} from "./types";

export const TrailAccount: React.FC = () => {
  const [teamId, teamSlug] = useStore((state) => [
    state.teamId,
    state.teamSlug,
  ]);

  return (
    <SettingsFormContainer<
      GetTeamSettingsData,
      UpdateTeamSettingsVariables,
      TrialAccountFormValues
    >
      query={GET_TEAM_SETTINGS}
      queryVariables={{ slug: teamSlug }}
      mutation={UPDATE_TEAM_SETTINGS}
      getInitialValues={({ teams: [team] }) => team.settings}
      getMutationVariables={(values) => ({
        teamId,
        settings: {
          is_trial: values.isTrial,
        },
      })}
      defaultValues={defaultValues}
      validationSchema={validationSchema}
      legend="Trial account"
      description={
        <>
          <p>Toggle this team between "trial account" and "full access".</p>
          <p>
            A trial account has limited access to PlanX features - they are not
            able to turn services online.
          </p>
          <p>
            Toggling this to a trial account will turn this team's flows
            offline.
          </p>
        </>
      }
    >
      {({ formik }) => (
        <Box>
          <Switch
            label="Trial account"
            name="isTrial"
            variant="editorPage"
            capitalize
            checked={formik.values.isTrial}
            onChange={() =>
              formik.setFieldValue("isTrial", !formik.values.isTrial)
            }
          />
        </Box>
      )}
    </SettingsFormContainer>
  );
};

export default TrailAccount;
