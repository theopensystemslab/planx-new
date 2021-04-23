import type { MoreInformation } from "../shared";

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
