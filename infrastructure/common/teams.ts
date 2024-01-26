// Secrets to be added to Pulumi when a new team is on-boarded
interface TeamSecrets {
  // Token for the GovUKPayment service
  // Provider by team
  govUKPayToken: string;
  // Uniform client details in the format clientId:clientSecret
  // Each customer may have multiple clients (e.g. historic Uniform instances prior to council mergers)
  // Provider by Idox
  uniformClient?: string;
};

interface Team {
  // Must match "team_slug" in the PlanX "teams" table
  name: string;
  // Must match "name" in the Digital Land dataset "local-authority-district" (https://www.planning.data.gov.uk/dataset/local-authority-district)
  uniformInstances?: string[];
  govPayStagingOnly?: boolean;
};

export const teams: Team[] = [
  {
    name: "Buckinghamshire",
    uniformInstances: ["Wycombe", "Chiltern", "Aylesbury Vale"],
  },
  {
    name: "Lambeth",
    uniformInstances: ["Lambeth"]
  },
  {
    name: "Southwark",
    uniformInstances: ["Southwark"]
  },
  {
    name: "Medway",
    govPayStagingOnly: true
  },
  {
    name: "Gloucester",
    govPayStagingOnly: true
  }
];

export type CustomDomains = Array<{
  name: string,
  domain: string
}>;

export default { teams }