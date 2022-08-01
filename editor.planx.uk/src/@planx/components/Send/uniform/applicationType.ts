/**
 * Application types in PlanX
 * Value for passport variable "application.type"
 */
export type PlanXAppTypes = "ldc.existing" | "ldc.proposed";

/**
 * Application types in Uniform
 * Used to construct XML fragment which denotes application type
 */
export type UniformAppTypes = {
  scenarioNumber: number;
  consentRegime: string;
};

/**
 * Mapping of PlanX -> Uniform planning applications types
 */
export const appTypeLookup: Record<PlanXAppTypes, UniformAppTypes> = {
  "ldc.existing": {
    scenarioNumber: 14,
    consentRegime: "Certificate of Lawfulness",
  },
  "ldc.proposed": {
    scenarioNumber: 15,
    consentRegime: "Certificate of Lawfulness",
  },
} as const;

export enum UniformInstance {
  Lambeth = "lambeth",
  Southwark = "southwark",
  // Buckinghamshire has 3 legacy instances
  Chiltern = "chiltern", // & South Bucks
  Aylesbury = "aylesbury-vale",
  Wycombe = "wycombe",
}

export const UniformLPACodes: { [key in UniformInstance]: string } = {
  [UniformInstance.Lambeth]: "N5660",
  [UniformInstance.Southwark]: "A5840",
  [UniformInstance.Aylesbury]: "J0405",
  [UniformInstance.Wycombe]: "K0425",
  [UniformInstance.Chiltern]: "X0415",
} as const;
