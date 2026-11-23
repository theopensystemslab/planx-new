export interface MultipleStripeAccountsFormValues {
  multipleStripeAccountsEnabled: boolean;
}

export interface GetMultipleStripeAccountsSettingData {
  teams: {
    id: number;
    name: string;
    settings: {
      multipleStripeAccountsEnabled: boolean;
    };
  }[];
  stripeAccounts: {
    id: number;
    name: string;
  }[];
}

export interface UpdateMultipleStripeAccountsSettingVariables {
  teamId: number;
  settings: {
    multiple_stripe_accounts_enabled: boolean;
  };
}
