import { z } from "zod";

import { FeeBreakdown, PassportFeeFields } from "./types";

export const toNumber = (input: number | [number]) =>
  Array.isArray(input) ? input[0] : input;

/**
 * A "reduction" is the sum of the difference between calculated and payable
 * This is not currently broken down further into component parts, or as exemptions or reductions
 */
export const calculateReduction = (data: PassportFeeFields) =>
  data["application.fee.calculated"]
    ? data["application.fee.calculated"] - data["application.fee.payable"]
    : 0;

/**
 * Transform Passport data to a FeeBreakdown shape
 */
export const toFeeBreakdown = (data: PassportFeeFields): FeeBreakdown => ({
  applicationFee:
    data["application.fee.calculated"] || data["application.fee.payable"],
  total: data["application.fee.payable"],
  vat: data["application.fee.payable.vat"],
  reduction: calculateReduction(data),
});

export const createPassportSchema = () => {
  const questionSchema = z.number().positive();
  const setValueSchema = z.tuple([z.coerce.number().positive()]);
  const feeSchema = z
    .union([questionSchema, setValueSchema])
    .transform(toNumber);

  const schema = z
    .object({
      "application.fee.calculated": feeSchema.optional().default(0),
      "application.fee.payable": feeSchema,
      "application.fee.payable.vat": feeSchema.optional().default(0),
    })
    .transform(toFeeBreakdown);

  return schema;
};
