import { formatGovPayMetadata } from "@opensystemslab/planx-core";
import {
  GovPayMetadata,
  GovUKCreatePaymentPayload,
  Passport as IPassport,
} from "@opensystemslab/planx-core/types";
import { useStore } from "pages/FlowEditor/lib/store";
import { ApplicationPath, Passport } from "types";
import { array, boolean, object, string } from "yup";

import { type BaseNodeData, parseBaseNodeData } from "../shared";

export interface Pay extends BaseNodeData {
  title: string;
  bannerTitle?: string;
  description?: string;
  color?: string;
  fn: string;
  instructionsTitle?: string;
  instructionsDescription?: string;
  hidePay?: boolean;
  allowInviteToPay?: boolean;
  secondaryPageTitle?: string;
  nomineeTitle?: string;
  nomineeDescription?: string;
  yourDetailsTitle?: string;
  yourDetailsDescription?: string;
  yourDetailsLabel?: string;
  govPayMetadata: GovPayMetadata[];
}

export const toPence = (decimal: number) => Math.trunc(decimal * 100);
export const toDecimal = (pence: number) => pence / 100;

export const formattedPriceWithCurrencySymbol = (
  amount: number,
  currency = "GBP",
) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
  }).format(amount);

export const createPayload = (
  fee: number,
  reference: string,
  metadata: GovPayMetadata[],
  passport: Passport,
): GovUKCreatePaymentPayload => ({
  amount: toPence(fee),
  reference,
  description: "New application",
  return_url: getReturnURL(reference),
  metadata: formatGovPayMetadata({
    metadata,
    userPassport: passport as IPassport,
    paidViaInviteToPay: false,
  }),
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

export const GOV_UK_PAY_URL = `${import.meta.env.VITE_APP_API_URL}/pay`;

export const REQUIRED_GOVPAY_METADATA = [
  "flow",
  "source",
  "paidViaInviteToPay",
];

// Validation must match requirements set out here -
// https://docs.payments.service.gov.uk/reporting/#add-more-information-to-a-payment-39-custom-metadata-39-or-39-reporting-columns-39
export const govPayMetadataSchema = array(
  object({
    key: string()
      .required("Key is a required field")
      .max(30, "Key length cannot exceed 30 characters"),
    value: string()
      .required("Value is a required field")
      .test({
        name: "max-length",
        message: "Value length cannot exceed 100 characters",
        test: (value) => {
          if (!value) return true;
          // No limit to dynamic passport variable length, this is checked and truncated at runtime
          if (value.startsWith("@")) return true;
          // Static strings must be 100 characters or less
          return value.length <= 100;
        },
      }),
  }),
)
  .max(10, "A maximum of 10 fields can be set as metadata")
  .test({
    name: "unique-keys",
    message: "Keys must be unique",
    test: (metadata) => {
      if (!metadata) return false;

      const keys = metadata.map((item) => item.key);
      const numKeys = keys?.length;
      const numUniqueKeys = new Set(keys).size;

      return numKeys === numUniqueKeys;
    },
  })
  .test({
    name: "required-keys",
    message: `Keys ${new Intl.ListFormat("en-GB", {
      style: "long",
      type: "conjunction",
    }).format(REQUIRED_GOVPAY_METADATA)} must be present`,
    test: (metadata) => {
      if (!metadata) return false;

      const keys = metadata.map((item) => item.key);
      const allRequiredKeysPresent = REQUIRED_GOVPAY_METADATA.every(
        (requiredKey) => keys.includes(requiredKey),
      );
      return allRequiredKeysPresent;
    },
  });

export const validationSchema = object({
  title: string().trim().required(),
  bannerTitle: string().trim().required(),
  description: string().trim().required(),
  fn: string().trim().required("Data field is required"),
  instructionsTitle: string().trim().required(),
  instructionsDescription: string().trim().required(),
  hidePay: boolean(),
  allowInviteToPay: boolean(),
  nomineeTitle: string().trim().when("allowInviteToPay", {
    is: true,
    then: string().required(),
  }),
  nomineeDescription: string().trim().when("allowInviteToPay", {
    is: true,
    then: string(),
  }),
  yourDetailsTitle: string().trim().when("allowInviteToPay", {
    is: true,
    then: string().required(),
  }),
  yourDetailsDescription: string().trim().when("allowInviteToPay", {
    is: true,
    then: string(),
  }),
  yourDetailsLabel: string().trim().when("allowInviteToPay", {
    is: true,
    then: string().required(),
  }),
  govPayMetadata: govPayMetadataSchema,
});

export const getDefaultContent = (): Pay => ({
  title: "Pay for your application",
  bannerTitle: "The planning fee for this application is",
  fn: "application.fee.payable",
  description: `<p>The planning fee covers the cost of processing your application.\
    <a href="https://www.gov.uk/guidance/fees-for-planning-applications" target="_self">Find out more about how planning fees are calculated</a> (opens in new tab).</p>`,
  instructionsTitle: "How to pay",
  instructionsDescription: `<p>You can pay for your application by using GOV.UK Pay.</p>\
    <p>Your application will be sent after you have paid the fee. \
    Wait until you see an application sent message before closing your browser.</p>`,
  hidePay: false,
  allowInviteToPay: true,
  secondaryPageTitle: "Invite someone else to pay for this application",
  nomineeTitle: "Details of the person paying",
  yourDetailsTitle: "Your details",
  yourDetailsLabel: "Your name or organisation name",
  govPayMetadata: [
    {
      key: "flow",
      value: useStore.getState().flowName,
    },
    {
      key: "source",
      value: "PlanX",
    },
    {
      key: "paidViaInviteToPay",
      value: "@paidViaInviteToPay",
    },
  ],
});

export const parsePay = (data?: Record<string, any>): Pay => ({
  ...parseBaseNodeData(data),
  ...getDefaultContent(),
  ...data,
});
