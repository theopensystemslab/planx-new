import { z } from "zod";

import { FeeBreakdown, PassportFeeFields } from "./types";

export const toNumber = (input: number | [number]) =>
  Array.isArray(input) ? input[0] : input;

/**
 * Convert a Passport value to an actual boolean
 */
const toBoolean = (val: ["true" | "false"]) => val[0] === "true";

const filterByKeyPrefix = (data: Record<string, unknown>, prefix: string) =>
  Object.fromEntries(
    Object.entries(data).filter(([k, _v]) => k.startsWith(prefix))
  );

/**
 * Iterate over exemptions or reductions to find matches, returning the granular keys
 */
  const getGranularKeys = (
  data: Record<string, boolean> | undefined = {},
  prefix: "application.fee.reduction" | "application.fee.exemption"
) => {
  const keys = Object.keys(data).filter((key) => data[key]);
  const granularKeys = keys.map((key) => key.replace(prefix + ".", ""));
  return granularKeys;
};

/**
 * A "reduction" is the sum of the difference between calculated and payable
 */
export const calculateReduction = ({ amount }: PassportFeeFields) =>
  amount["application.fee.calculated"]
    ? amount["application.fee.calculated"] - amount["application.fee.payable"]
    : 0;

/**
 * Transform Passport data to a FeeBreakdown
 */
export const toFeeBreakdown = (data: PassportFeeFields): FeeBreakdown => ({
  amount: {
    applicationFee:
      data.amount["application.fee.calculated"] ||
      data.amount["application.fee.payable"],
    total: data.amount["application.fee.payable"],
    vat: data.amount["application.fee.payable.vat"],
    reduction: calculateReduction(data),
  },
  reductions: getGranularKeys(data.reductions, "application.fee.reduction"),
  exemptions: getGranularKeys(data.exemptions, "application.fee.exemption"),
});

export const preProcessPassport = (data: Record<string, unknown>) => ({
  amount: filterByKeyPrefix(data, "application.fee"),
  reductions: filterByKeyPrefix(data, "application.fee.reduction"),
  exemptions: filterByKeyPrefix(data, "application.fee.exemption"),
});

export const createPassportSchema = () => {
  const questionSchema = z.number().nonnegative();
  const setValueSchema = z.tuple([z.coerce.number().nonnegative()]);
  const feeSchema = z
    .union([questionSchema, setValueSchema])
    .transform(toNumber);

  const amountsSchema = z.object({
    "application.fee.calculated": feeSchema.optional().default(0),
    "application.fee.payable": feeSchema,
    "application.fee.payable.vat": feeSchema.optional().default(0),
  });

  const reductionsSchema = z
    .record(
      z.string(),
      z.tuple([z.enum(["true", "false"])]).transform(toBoolean)
    )
    .optional();

  const exemptionsSchema = z
    .record(
      z.string(),
      z.tuple([z.enum(["true", "false"])]).transform(toBoolean)
    )
    .optional();

  const schema = z
    .object({
      amount: amountsSchema,
      reductions: reductionsSchema,
      exemptions: exemptionsSchema,
    })
    .transform(toFeeBreakdown);

  return schema;
};
