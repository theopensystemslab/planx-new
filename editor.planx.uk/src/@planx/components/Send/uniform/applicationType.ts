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
};
