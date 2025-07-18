import sumBy from "lodash/sumBy";

import { ServiceCharge } from "./types";

export const quarterlyInvoiceDates: Record<number, string> = {
  1: "April 30",
  2: "July 30",
  3: "October 30",
  4: "January 30",
};

export const sumServiceCharges = (serviceCharges: ServiceCharge[]) => {
  const sum = sumBy(serviceCharges, "amount") || 0;
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(sum);
};
