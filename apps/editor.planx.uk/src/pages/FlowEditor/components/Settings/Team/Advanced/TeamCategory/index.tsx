import MenuItem from "@mui/material/MenuItem";
import { TEAM_CATEGORIES, TEAM_CATEGORY_LABELS } from "lib/teamCategories";
import { useStore } from "pages/FlowEditor/lib/store";
import SelectInput from "ui/shared/SelectInput/SelectInput";

import SettingsFormContainer from "../../../shared/SettingsForm";
import { GET_TEAM_CATEGORY, UPDATE_TEAM_CATEGORY } from "./queries";
import { defaultValues, validationSchema } from "./schema";
import type {
  GetTeamCategoryData,
  TeamCategoryFormValues,
  UpdateTeamCategoryVariables,
} from "./types";

const TeamCategory: React.FC = () => {
  const [teamId, teamSlug] = useStore((state) => [
    state.teamId,
    state.teamSlug,
  ]);

  return (
    <SettingsFormContainer<
      GetTeamCategoryData,
      UpdateTeamCategoryVariables,
      TeamCategoryFormValues
    >
      query={GET_TEAM_CATEGORY}
      queryVariables={{ slug: teamSlug }}
      mutation={UPDATE_TEAM_CATEGORY}
      getInitialValues={({ teams: [team] }) => ({ category: team.category })}
      getMutationVariables={(values) => ({
        teamId,
        category: values.category,
      })}
      defaultValues={defaultValues}
      validationSchema={validationSchema}
      legend="Team category"
      description={
        <>
          <p>
            Set whether this team is a local planning authority (LPA), an
            internal PlanX team, or another organisation.
          </p>
          <p>Only LPAs are included in platform-wide reporting.</p>
        </>
      }
    >
      {({ formik }) => (
        <SelectInput
          name="category"
          bordered
          value={formik.values.category}
          onChange={(e) => formik.setFieldValue("category", e.target.value)}
          inputProps={{ "aria-label": "Team category" }}
        >
          {TEAM_CATEGORIES.map((category) => (
            <MenuItem key={category} value={category}>
              {TEAM_CATEGORY_LABELS[category]}
            </MenuItem>
          ))}
        </SelectInput>
      )}
    </SettingsFormContainer>
  );
};

export default TeamCategory;
