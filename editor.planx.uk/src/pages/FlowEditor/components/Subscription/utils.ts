import sumBy from "lodash/sumBy";

import { ServiceCharge } from "./types";

// Quarters reflect UK Fiscal Year, so Q1 = April 1 - June 30 => invoice due July 30
export const quarterlyInvoiceDates: Record<number, string> = {
  4: "April 30",
  1: "July 30",
  2: "October 30",
  3: "January 30",
};

export const sumServiceCharges = (serviceCharges: ServiceCharge[]) => {
  const sum = sumBy(serviceCharges, "amount") || 0;
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(sum);
};

// UK Fiscal Year starts April 1, so Jan - March = FY Q4, April - June = FY Q1 and so on
export const getUKFiscalYearQuarter = (calendarQuarter: number) => {
  if (calendarQuarter === 1) return 4;
  return calendarQuarter - 1;
};

export const getUKFiscalYear = (fyQuarter: number, calendarYear: number) => {
  if (fyQuarter === 4) return calendarYear - 1;
  return calendarYear;
};
