import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useStore } from "pages/FlowEditor/lib/store";
import { Switch } from "ui/shared/Switch";

import SettingsFormContainer from "../../../shared/SettingsForm";
import {
  GET_MULTIPLE_STRIPE_ACCOUNTS_SETTING,
  UPDATE_MULTIPLE_STRIPE_ACCOUNTS_SETTING,
} from "./queries";
import { defaultValues, validationSchema } from "./schema";
import type {
  GetMultipleStripeAccountsSettingData,
  MultipleStripeAccountsFormValues,
  UpdateMultipleStripeAccountsSettingVariables,
} from "./types";

/**
 * Accounts other than the one named after the team - only a team with multiple accounts can have these
 */
const getNamedAccounts = (data?: GetMultipleStripeAccountsSettingData) => {
  const teamName = data?.teams[0]?.name;
  return (data?.stripeAccounts ?? []).filter(({ name }) => name !== teamName);
};

const MultipleStripeAccounts: React.FC = () => {
  const [teamId, teamSlug] = useStore((state) => [
    state.teamId,
    state.teamSlug,
  ]);

  return (
    <SettingsFormContainer<
      GetMultipleStripeAccountsSettingData,
      UpdateMultipleStripeAccountsSettingVariables,
      MultipleStripeAccountsFormValues
    >
      query={GET_MULTIPLE_STRIPE_ACCOUNTS_SETTING}
      queryVariables={{ slug: teamSlug }}
      mutation={UPDATE_MULTIPLE_STRIPE_ACCOUNTS_SETTING}
      getInitialValues={({ teams: [team] }) => team.settings}
      getMutationVariables={(values) => ({
        teamId,
        settings: {
          multiple_stripe_accounts_enabled:
            values.multipleStripeAccountsEnabled,
        },
      })}
      defaultValues={defaultValues}
      validationSchema={validationSchema}
      legend="Multiple Stripe accounts"
      description={
        <>
          <p>
            Toggle whether this team can connect more than one Stripe account,
            e.g. for a team made up of several councils.
          </p>
          <p>
            Each payment is made to the account named after the site's local
            authority district.
          </p>
        </>
      }
    >
      {({ formik, data }) => {
        const namedAccounts = getNamedAccounts(data);
        // Disable turning off if team has named accounts
        // toggling off would hide the settings section but payments would still flow i.e. confusing
        const isLocked =
          Boolean(data?.teams[0]?.settings.multipleStripeAccountsEnabled) &&
          namedAccounts.length > 0;

        return (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Switch
              label="Multiple Stripe accounts"
              name="multipleStripeAccountsEnabled"
              variant="editorPage"
              capitalize
              disabled={isLocked}
              checked={formik.values.multipleStripeAccountsEnabled}
              onChange={() =>
                formik.setFieldValue(
                  "multipleStripeAccountsEnabled",
                  !formik.values.multipleStripeAccountsEnabled,
                )
              }
            />
            {isLocked && (
              <Typography variant="body2">
                This can't be turned off while the team has other Stripe
                accounts ({namedAccounts.map(({ name }) => name).join(", ")}).
              </Typography>
            )}
          </Box>
        );
      }}
    </SettingsFormContainer>
  );
};

export default MultipleStripeAccounts;
