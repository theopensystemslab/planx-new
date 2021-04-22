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

// https://docs.payments.service.gov.uk/making_payments/#receiving-the-api-response
export interface GovUKPayment {
  amount: number;
  reference: string;
  state: {
    // https://docs.payments.service.gov.uk/api_reference/#status-and-finished
    status:
      | "created"
      | "started"
      | "submitted"
      | "capturable"
      | "success"
      | "failed"
      | "cancelled"
      | "error";
    finished: boolean;
  };
  payment_id: string;
  created_date: string;
  _links: {
    self: {
      href: string;
      method: string;
    };
    next_url: {
      href: string;
      method: string;
    };
    next_url_post: {
      type: string;
      params: {
        chargeTokenId: string;
      };
      href: string;
      method: string;
    };
  };
}
