import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { Switch } from "ui/shared/Switch";

import SettingsFormContainer from "../../../shared/SettingsForm";
import { GET_TEAM_CONSTRAINTS, UPDATE_TEAM_CONSTRAINTS } from "./queries";
import { defaultValues, validationSchema } from "./schema";
import { GetTeamConstraintsData, TeamConstraintsFormValues, UpdateTeamConstraintsVariables } from "./types";

const Constraints: React.FC = () => {
  const [teamId] = useStore((state) => [
    state.teamId,
  ]);

  return (
    <SettingsFormContainer<
      GetTeamConstraintsData,
      UpdateTeamConstraintsVariables,
      TeamConstraintsFormValues
    >
      query={GET_TEAM_CONSTRAINTS}
      defaultValues={defaultValues}
      queryVariables={{ teamId: teamId }}
      mutation={UPDATE_TEAM_CONSTRAINTS}
      getInitialValues={({ integrations: [integration] }) => integration }
      getMutationVariables={(values) => ({
        teamId: teamId,
        hasPlanningData: values.hasPlanningData,
      })}
      validationSchema={validationSchema}
      legend="Planning constraints"
      description={
        <>
          <Typography variant="body2">
            Platform admins determine when a team is ready to query planning constraints data.
          </Typography>
          <Typography variant="body2">
            Only toggle "on" after manually confirming that council-provided datasets have been published to Planning Data so that the risk of returning false negatives is low.
          </Typography>
        </>
      }
    >
      {({ formik }) => (
        <Box>
          <Switch
            label="Enable planning constraints"
            name="hasPlanningData"
            variant="editorPage"
            capitalize
            checked={formik.values.hasPlanningData}
            onChange={() =>
              formik.setFieldValue("hasPlanningData", !formik.values.hasPlanningData)
            }
          />
        </Box>
      )}
    </SettingsFormContainer>
  );
};

export default Constraints;