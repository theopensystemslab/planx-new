import MenuItem from "@mui/material/MenuItem";
import { useStore } from "pages/FlowEditor/lib/store";
import SelectInput from "ui/shared/SelectInput/SelectInput";

import SettingsFormContainer from "../../../shared/SettingsForm";
import { GET_TEAM_SETTINGS, UPDATE_TEAM_SETTINGS } from "./queries";
import { defaultValues, validationSchema } from "./schema";
import type {
  ContractFormValues,
  GetTeamSettingsData,
  UpdateTeamSettingsVariables} from "./types";
import {
  CONTRACT_LABELS,
  CONTRACT_VALUES
} from "./types";

const ContractType: React.FC = () => {
  const [teamId, teamSlug] = useStore((state) => [
    state.teamId,
    state.teamSlug,
  ]);

  return (
    <SettingsFormContainer<
      GetTeamSettingsData,
      UpdateTeamSettingsVariables,
      ContractFormValues
    >
      query={GET_TEAM_SETTINGS}
      queryVariables={{ slug: teamSlug }}
      mutation={UPDATE_TEAM_SETTINGS}
      getInitialValues={({ teams: [team] }) => team.settings}
      getMutationVariables={(values) => ({
        teamId,
        settings: {
          contract: values.contract,
        },
      })}
      defaultValues={defaultValues}
      validationSchema={validationSchema}
      legend="Contract type"
      description={
        <>
          <p>Set which type of contract applies to this team.</p>
          <p>
            Contract type impacts how service charges are applied, how a teams'
            Subscription page displays, and more.
          </p>
        </>
      }
    >
      {({ formik }) => (
        <SelectInput
          name="contract"
          bordered
          value={formik.values.contract || ""}
          onChange={(e) => formik.setFieldValue("contract", e.target.value)}
          inputProps={{ "aria-label": "Contract type" }}
        >
          {CONTRACT_VALUES.map((contract) => (
            <MenuItem key={contract} value={contract}>
              {CONTRACT_LABELS[contract]}
            </MenuItem>
          ))}
        </SelectInput>
      )}
    </SettingsFormContainer>
  );
};

export default ContractType;
