import { formattedPriceWithCurrencySymbol } from "@planx/components/Pay/model";
import { stringify } from "csv-stringify/sync";
import sumBy from "lodash/sumBy";

import type { ServiceCharge } from "./types";

export const sumServiceCharges = (serviceCharges: ServiceCharge[]) => {
  const sum = sumBy(serviceCharges, "amount") || 0;
  return formattedPriceWithCurrencySymbol(sum);
};

// Quarters reflect UK Fiscal Year, so Q1 = April 1-June 30 => invoice due July 30
export const quarterlyInvoiceDates: Record<number, string> = {
  4: "April 30",
  1: "July 30",
  2: "October 30",
  3: "January 30",
};

// UK Fiscal Year starts April 1, so Jan-March = FY Q4, April-June = FY Q1 and so on
export const getUKFiscalYearQuarter = (calendarQuarter: number) => {
  if (calendarQuarter === 1) return 4;
  return calendarQuarter - 1;
};

// We group/categorise the fiscal year based on the "start year", so ensure Q4 gets assigned to previous year (eg Jan 1 2026 (Q4) = FY 2025)
export const getUKFiscalYear = (fyQuarter: number, calendarYear: number) => {
  if (fyQuarter === 4) return calendarYear - 1;
  return calendarYear;
};

/**
 * @example 2025 => "FY 2025/26"
 */
export const formatUKFiscalYear = (fiscalYear: number): string => {
  const abbreviatedYear = Number(fiscalYear.toString().slice(-2));
  return `FY ${fiscalYear}/${abbreviatedYear + 1}`;
};

export const generateServiceChargesCsv = (
  serviceCharges: ServiceCharge[],
): string =>
  stringify(serviceCharges, {
    header: true,
    columns: [
      { key: "flowName", header: "Flow name" },
      { key: "sessionId", header: "Session ID" },
      { key: "paymentId", header: "Payment ID" },
      { key: "amount", header: "Amount (excl VAT)" },
      { key: "paidAt", header: "Paid at" },
    ],
  });

export const downloadServiceChargesCsv = (
  serviceCharges: ServiceCharge[],
  filename: string,
): void => {
  const csv = generateServiceChargesCsv(serviceCharges);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};
