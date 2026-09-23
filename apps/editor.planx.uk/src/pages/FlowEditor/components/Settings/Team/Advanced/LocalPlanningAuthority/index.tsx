import Box from "@mui/material/Box";
import { useStore } from "pages/FlowEditor/lib/store";
import { Switch } from "ui/shared/Switch";

import SettingsFormContainer from "../../../shared/SettingsForm";
import { GET_TEAM_IS_LPA, UPDATE_TEAM_IS_LPA } from "./queries";
import { defaultValues, validationSchema } from "./schema";
import type {
  GetTeamIsLpaData,
  LocalPlanningAuthorityFormValues,
  UpdateTeamIsLpaVariables,
} from "./types";

const LocalPlanningAuthority: React.FC = () => {
  const [teamId, teamSlug] = useStore((state) => [
    state.teamId,
    state.teamSlug,
  ]);

  return (
    <SettingsFormContainer<
      GetTeamIsLpaData,
      UpdateTeamIsLpaVariables,
      LocalPlanningAuthorityFormValues
    >
      query={GET_TEAM_IS_LPA}
      queryVariables={{ slug: teamSlug }}
      mutation={UPDATE_TEAM_IS_LPA}
      getInitialValues={({ teams: [team] }) => ({ isLpa: team.isLpa })}
      getMutationVariables={(values) => ({
        teamId,
        isLpa: values.isLpa,
      })}
      defaultValues={defaultValues}
      validationSchema={validationSchema}
      legend="Local planning authority"
      description={
        <>
          <p>Toggle whether this team is a local planning authority (LPA).</p>
          <p>
            Internal, testing and template teams should not be LPAs. Only LPAs
            are included in platform-wide reporting.
          </p>
        </>
      }
    >
      {({ formik }) => (
        <Box>
          <Switch
            label="Local planning authority"
            name="isLpa"
            variant="editorPage"
            capitalize
            checked={formik.values.isLpa}
            onChange={() => formik.setFieldValue("isLpa", !formik.values.isLpa)}
          />
        </Box>
      )}
    </SettingsFormContainer>
  );
};

export default LocalPlanningAuthority;
