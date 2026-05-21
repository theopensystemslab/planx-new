// Secrets to be added to Pulumi when a new team is on-boarded
export interface TeamSecrets {
  // Token for the GovUKPayment service
  // Provider by team
  govUKPayToken: string;
  // Uniform client details in the format clientId:clientSecret
  // Each customer may have multiple clients (e.g. historic Uniform instances prior to council mergers)
  // Provider by Idox
  uniformClient?: string;
};

export interface Team {
  // Must match "team_slug" in the PlanX "teams" table
  name: string;
  // Must match "name" in the Digital Land dataset "local-authority-district" (https://www.planning.data.gov.uk/dataset/local-authority-district)
  uniformInstances?: string[];
  govPayStagingOnly?: boolean;
};

/**
 * Describes which AWS ACM + CloudFront infrastructure serves a custom domain.
 *
 * On-boarding path for new councils: validation-only → shared-final
 * Migration path for existing councils: legacy-with-validation → cutover-ongoing → shared-final
 * 
 * See doc/how-to/how-to-setup-custom-domains.md for more detail.
 */
export type CloudFrontState =
  | "validation-only"           // no CDN yet; mining cert surfaces DNS validation records
  | "legacy-with-validation"    // legacy per-domain CDN running; mining cert surfaces validation records
  | "cutover-ongoing"           // migrating: shared CDN spun up if needed; alias to be transferred from legacy to shared CDN
  | "shared-final";             // shared CDN only; legacy CDN torn down (if it existed)

export interface CustomDomain {
  name: string,
  domain: string,
  certificateLocation?: "secretsManager" | "pulumiConfig",
  cloudFrontState: CloudFrontState,
}

export interface DbUrlArgs {
  role: string;
  password: string;
  host: string;
  port?: string | number;
  database?: string;
}
