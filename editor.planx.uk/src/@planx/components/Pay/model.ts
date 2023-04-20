import { useStore } from "pages/FlowEditor/lib/store";
import { ApplicationPath } from "types";
import { boolean, object, string } from "yup";

import type { MoreInformation } from "../shared";

export interface Pay extends MoreInformation {
  title?: string;
  bannerTitle?: string;
  description?: string;
  color?: string;
  fn?: string;
  instructionsTitle?: string;
  instructionsDescription?: string;
  allowInviteToPay?: boolean;
  secondaryPageTitle?: string;
  nomineeTitle?: string;
  nomineeDescription?: string;
  yourDetailsTitle?: string;
  yourDetailsDescription?: string;
  yourDetailsLabel?: string;
}

// https://docs.payments.service.gov.uk/making_payments/#creating-a-payment
export interface GovUKCreatePaymentPayload {
  amount: number;
  reference: string;
  description: string;
  return_url: string;
  email?: string;
  prefilled_cardholder_details?: {
    cardholder_name?: string;
    billing_address?: {
      line1: string;
      line2: string;
      postcode: string;
      city: string;
      country: string;
    };
  };
  language?: string;
  metadata?: any;
}

export const toPence = (decimal: number) => Math.trunc(decimal * 100);
export const toDecimal = (pence: number) => pence / 100;

export const formattedPriceWithCurrencySymbol = (
  amount: number,
  currency = "GBP"
) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
  }).format(amount);

export const createPayload = (
  fee: number,
  reference: string
): GovUKCreatePaymentPayload => ({
  amount: toPence(fee),
  reference,
  description: "New application",
  return_url: getReturnURL(reference),
});

/**
 * For Save & Return, include sessionId and email as query params so the session can be picked up
 */
const getReturnURL = (sessionId: string): string => {
  const isSaveReturn =
    useStore.getState().path === ApplicationPath.SaveAndReturn;
  if (isSaveReturn) {
    const email = useStore.getState().saveToEmail!;
    const params = new URLSearchParams({ sessionId, email });
    return `${window.location.href.split("?")[0]}?${params}`;
  }
  return window.location.href;
};

export const GOV_UK_PAY_URL = `${process.env.REACT_APP_API_URL}/pay`;

export const GOV_PAY_PASSPORT_KEY = "application.fee.reference.govPay" as const;

export const validationSchema = object({
  title: string().trim().required(),
  bannerTitle: string().trim().required(),
  description: string().trim().required(),
  fn: string().trim().required(),
  instructionsTitle: string().trim().required(),
  instructionsDescription: string().trim().required(),
  allowInviteToPay: boolean(),
  nomineeTitle: string().trim().when("allowInviteToPay", {
    is: true,
    then: string().required(),
  }),
  nomineeDescription: string().trim().when("allowInviteToPay", {
    is: true,
    then: string().required(),
  }),
  yourDetailsTitle: string().trim().when("allowInviteToPay", {
    is: true,
    then: string().required(),
  }),
  yourDetailsDescription: string().trim().when("allowInviteToPay", {
    is: true,
    then: string().required(),
  }),
  yourDetailsLabel: string().trim().when("allowInviteToPay", {
    is: true,
    then: string().required(),
  }),
});
