import { formattedPriceWithCurrencySymbol } from "@planx/components/Pay/model";
import sumBy from "lodash/sumBy";

import { ServiceCharge } from "./types";

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
