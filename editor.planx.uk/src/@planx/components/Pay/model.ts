import type { MoreInformation } from "../shared";

export function toGBP(amount: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(amount);
}

export interface Pay extends MoreInformation {
  title?: string;
  description?: string;
  color?: string;
  fn?: string;
  url?: string;
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

export const createPayload = (
  fee: number,
  reference: string
): GovUKCreatePaymentPayload => ({
  amount: toPence(fee),
  reference,
  description: "New application",
  return_url: window.location.href,
});

export type ComponentState = "loading" | "init" | "incomplete";
export enum Event {
  NoPaymentFound,
  IncompletePaymentFound,
  StartNewPayment,
  ResumePayment,
  Success,
}

export const reducer = (
  state: ComponentState,
  event: Event
): ComponentState => {
  switch (event) {
    case Event.NoPaymentFound:
      return "init";
    case Event.StartNewPayment:
      return "loading";
    case Event.Success:
      return "loading";
    case Event.ResumePayment:
      return "loading";
    case Event.IncompletePaymentFound:
      return "incomplete";
  }
};
