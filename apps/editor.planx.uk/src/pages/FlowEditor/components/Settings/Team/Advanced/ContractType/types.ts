/**
 * Values of the team_contract_enum table (team_settings.contract)
 */
export const CONTRACT_VALUES = ["with_sc", "opt_out_sc", "none"] as const;

export type ContractType = (typeof CONTRACT_VALUES)[number];

export const CONTRACT_LABELS: Record<ContractType, string> = {
  with_sc: "Full contract with service charges",
  opt_out_sc: "Full contract opted out of service charges",
  none: "No contract, eg internal team",
};

export interface ContractFormValues {
  contract: ContractType;
}

export interface GetTeamSettingsData {
  teams: {
    id: string;
    settings: {
      contract: ContractType;
    };
  }[];
}

export interface UpdateTeamSettingsVariables {
  teamId: number;
  settings: {
    contract: ContractType;
  };
}
