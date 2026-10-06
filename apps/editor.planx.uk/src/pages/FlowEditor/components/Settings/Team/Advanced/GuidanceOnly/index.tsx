import Box from "@mui/material/Box";
import { useStore } from "pages/FlowEditor/lib/store";
import { Switch } from "ui/shared/Switch";

import SettingsFormContainer from "../../../shared/SettingsForm";
import { GET_TEAM_SETTINGS, UPDATE_TEAM_SETTINGS } from "./queries";
import { defaultValues, validationSchema } from "./schema";
import type {
  GetTeamSettingsData,
  GuidanceOnlyFormValues,
  UpdateTeamSettingsVariables,
} from "./types";

const GuidanceOnly: React.FC = () => {
  const [teamId, teamSlug] = useStore((state) => [
    state.teamId,
    state.teamSlug,
  ]);

  return (
    <SettingsFormContainer<
      GetTeamSettingsData,
      UpdateTeamSettingsVariables,
      GuidanceOnlyFormValues
    >
      query={GET_TEAM_SETTINGS}
      queryVariables={{ slug: teamSlug }}
      mutation={UPDATE_TEAM_SETTINGS}
      getInitialValues={({ teams: [team] }) => team.settings}
      getMutationVariables={(values) => ({
        teamId,
        settings: {
          is_guidance_only: values.isGuidanceOnly,
        },
      })}
      defaultValues={defaultValues}
      validationSchema={validationSchema}
      legend="Guidance only"
      description={
        <>
          <p>
            Toggle whether this team is contractually restricted to "guidance
            only" and is not able to go live with submission services.
          </p>
          <p>
            A guidance only team cannot set submission services online in
            production.
          </p>
        </>
      }
    >
      {({ formik }) => (
        <Box>
          <Switch
            label="Guidance only"
            name="isGuidanceOnly"
            variant="editorPage"
            capitalize
            checked={formik.values.isGuidanceOnly}
            onChange={() =>
              formik.setFieldValue(
                "isGuidanceOnly",
                !formik.values.isGuidanceOnly,
              )
            }
          />
        </Box>
      )}
    </SettingsFormContainer>
  );
};

export default GuidanceOnly;
