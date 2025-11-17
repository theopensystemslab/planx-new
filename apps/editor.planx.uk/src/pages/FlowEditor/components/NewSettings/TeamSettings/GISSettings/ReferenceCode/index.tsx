import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { ChangeEvent } from "react";
import InputLabel from "ui/editor/InputLabel";
import Input from "ui/shared/Input/Input";

import SettingsFormContainer from "../../../shared/SettingsForm";
import { GET_TEAM_SETTINGS, UPDATE_TEAM_SETTINGS } from "./queries";
import { defaultValues, validationSchema } from "./schema";
import {
  GetTeamSettingsData,
  ReferenceCodeFormValues,
  UpdateTeamSettingsVariables,
} from "./types";

const ReferenceCode: React.FC = () => {
  const [teamId, teamSlug] = useStore((state) => [
    state.teamId,
    state.teamSlug,
  ]);

  return (
    <SettingsFormContainer<
      GetTeamSettingsData,
      UpdateTeamSettingsVariables,
      ReferenceCodeFormValues
    >
      query={GET_TEAM_SETTINGS}
      defaultValues={defaultValues}
      queryVariables={{ slug: teamSlug }}
      mutation={UPDATE_TEAM_SETTINGS}
      getInitialValues={({ teams: [team] }) => team.settings}
      getMutationVariables={(values) => ({
        teamId,
        settings: {
          reference_code: values.referenceCode,
        },
      })}
      validationSchema={validationSchema}
      legend="Local authority reference code"
      description={
        <>
          <Typography variant="body2">
            Your local authority reference code is required for submissions and
            GIS integrations. This is a unique three to five-letter code per
            local authority.
          </Typography>
          <Typography variant="body2">
            Find your reference code on Planning Data at:{" "}
            <Link
              href="https://www.planning.data.gov.uk/entity/?dataset=local-authority"
              target="_blank"
              rel="noopener noreferrer"
            >
              https://www.planning.data.gov.uk/entity/?dataset=local-authority
            </Link>
          </Typography>
        </>
      }
    >
      {({ formik }) => (
        <InputLabel label="Reference code" htmlFor="referenceCode">
          <Input
            name="referenceCode"
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              formik.setFieldValue(
                "referenceCode",
                e.target.value.toUpperCase(),
              )
            }
            value={formik.values.referenceCode}
            errorMessage={
              typeof formik.errors.referenceCode === "string"
                ? formik.errors.referenceCode
                : undefined
            }
            id="referenceCode"
          />
        </InputLabel>
      )}
    </SettingsFormContainer>
  );
};

export default ReferenceCode;
