// Secrets to be added to Pulumi when a new customer is on-boarded
interface CustomerSecrets {
  // Token for the GovUKPayment service
  // Provider by customer
  govUKPayToken: string;
  // Uniform client details in the format clientId:clientSecret
  // Each customer may have multiple clients (e.g. historic Uniform instances prior to council mergers)
  // Provider by Idox
  uniformClient?: string;
};

interface Customer {
  // Must match "team_slug" in the PlanX "teams" table
  name: string;
  // Must match "name" in the Digital Land dataset "local-authority-district" (https://www.digital-land.info/dataset/local-authority-district)
  uniformInstances?: string[];
};

export const customers: Customer[] = [
  {
    name: "Buckinghamshire",
    uniformInstances: ["South Bucks", "Wycombe", "Chiltern", "Aylesbury Vale"],
  },
  {
    name: "Lambeth",
    uniformInstances: ["Lambeth"]
  },
  {
    name: "Southwark",
    uniformInstances: ["Southwark"]
  },
];

export default { customers }