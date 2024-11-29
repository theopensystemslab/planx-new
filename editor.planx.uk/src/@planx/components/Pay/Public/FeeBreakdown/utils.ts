import { z } from "zod";

import { FeeBreakdown, PassportFeeFields } from "./types";

export const toNumber = (input: number | [number]) =>
  Array.isArray(input) ? input[0] : input;

/**
 * A "reduction" is the sum of the difference between calculated and payable
 * This is not currently broken down further into component parts, or as exemptions or reductions
 */
export const calculateReduction = ({ amount }: PassportFeeFields) =>
  amount["application.fee.calculated"]
    ? amount["application.fee.calculated"] - amount["application.fee.payable"]
    : 0;

/**
 * Transform Passport data to a FeeBreakdown shape
 */
export const toFeeBreakdown = (data: PassportFeeFields): FeeBreakdown => ({
  amount: {
    applicationFee:
      data.amount["application.fee.calculated"] || data.amount["application.fee.payable"],
    total: data.amount["application.fee.payable"],
    vat: data.amount["application.fee.payable.vat"],
    reduction: calculateReduction(data),
  }
});

const filterByKey = (data: Record<string, unknown>, key: string) => 
  Object.fromEntries(Object.entries(data).filter(([k, _v]) => k.startsWith(key)))

export const preProcessPassport = (data: Record<string, unknown>) => ({
  amount: filterByKey(data, "application.fee"),
});

export const createPassportSchema = () => {
  const questionSchema = z.number().nonnegative();
  const setValueSchema = z.tuple([z.coerce.number().nonnegative()]);
  const feeSchema = z
    .union([questionSchema, setValueSchema])
    .transform(toNumber);

  const amountsSchema = z
    .object({
      "application.fee.calculated": feeSchema.optional().default(0),
      "application.fee.payable": feeSchema,
      "application.fee.payable.vat": feeSchema.optional().default(0),
    });

  const schema = z
    .object({
      amount: amountsSchema,

    }).transform(toFeeBreakdown);

  return schema;
};
