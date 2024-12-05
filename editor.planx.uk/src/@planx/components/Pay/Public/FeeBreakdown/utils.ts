import { z } from "zod";

import { FeeBreakdown, PassportFeeFields } from "./types";

export const toNumber = (input: number | [number]) =>
  Array.isArray(input) ? input[0] : input;

/**
 * Convert a Passport value to an actual boolean
 */
const toBoolean = (val: ["true" | "false"]) => val[0] === "true";


/**
 * Iterate over exemptions or reductions to find matches, returning the granular keys
 */
  const getGranularKeys = (
    data: PassportFeeFields,
    prefix: "application.fee.reduction" | "application.fee.exemption"
  ) => {
    const keys = Object.keys(data) as (keyof PassportFeeFields)[];
    const intersectingKeys = keys.filter(
      (key) => key.startsWith(prefix) && Boolean(data[key])
    );
    const granularKeys = intersectingKeys.map((key) =>
      key.replace(prefix + ".", "")
    );

    return granularKeys;
  };

/**
 * A "reduction" is the sum of the difference between calculated and payable
 */
export const calculateReduction = (data: PassportFeeFields) =>
  data["application.fee.calculated"]
    ? data["application.fee.calculated"] - data["application.fee.payable"]
    : 0;

/**
 * Transform Passport data to a FeeBreakdown
 */
export const toFeeBreakdown = (data: PassportFeeFields): FeeBreakdown => ({
  amount: {
    applicationFee:
      data["application.fee.calculated"] ||
      data["application.fee.payable"],
    total: data["application.fee.payable"],
    vat: data["application.fee.payable.vat"],
    reduction: calculateReduction(data),
  },
  reductions: getGranularKeys(data, "application.fee.reduction"),
  exemptions: getGranularKeys(data, "application.fee.exemption"),
});

export const createPassportSchema = () => {
  const questionSchema = z.number().nonnegative();
  const setValueSchema = z.tuple([z.coerce.number().nonnegative()]);
  const feeSchema = z
    .union([questionSchema, setValueSchema])
    .transform(toNumber);

  /** Describes how boolean values are set via PlanX components */
  const booleanSchema = z
    .tuple([z.enum(["true", "false"])])
    .default(["false"])
    .transform(toBoolean)

  const schema = z
    .object({
      "application.fee.calculated": feeSchema.optional().default(0),
      "application.fee.payable": feeSchema,
      "application.fee.payable.vat": feeSchema.optional().default(0),
      "application.fee.reduction.alternative": booleanSchema,
      "application.fee.reduction.parishCouncil": booleanSchema,
      "application.fee.reduction.sports": booleanSchema,
      "application.fee.exemption.disability": booleanSchema,
      "application.fee.exemption.resubmission": booleanSchema,
    })
    .transform(toFeeBreakdown);

  return schema;
};
