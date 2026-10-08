import type { PassportFeeFields } from "@opensystemslab/planx-core/types";
import { subDays } from "date-fns";

import { queryMock } from "../../../../tests/graphqlQueryMock.js";
import { mockPaymentStatusInsert } from "../../webhook/test/mocks.js";

export const mockCreate = vi.fn();
export const mockRetrieve = vi.fn();
export const mockExpire = vi.fn();

export const mockStripeModule = {
  default: class MockStripe {
    checkout = {
      sessions: {
        create: mockCreate,
        retrieve: mockRetrieve,
        expire: mockExpire,
      },
    };
  },
};

export const mockGetTeamBySlug = vi.fn();
export const mockGetStripeAccountId = vi.fn();
export const mockIsAccountReadyForPayments = vi.fn();

export const mockConnectServiceModule = {
  getTeamBySlug: (...args: unknown[]) => mockGetTeamBySlug(...args),
  getStripeAccountId: (...args: unknown[]) => mockGetStripeAccountId(...args),
  isAccountReadyForPayments: (...args: unknown[]) =>
    mockIsAccountReadyForPayments(...args),
};

export const STRIPE_ACCOUNT_ID = "acct_test_southwark";

export const stripeTeam = {
  id: 1,
  slug: "southwark",
  settings: { paymentProvider: "stripe" },
};

export const defaultMetadata = {
  flow: "Apply for planning permission",
  source: "PlanX",
  paidViaInviteToPay: "false",
};

export const validBody = {
  sessionId: "f2d8ca1d-a43b-43ec-b3d9-a9fec63ff19c",
  flowId: "7cd1c4b4-4229-424f-8d04-c9fdc958ef4e",
  metadata: defaultMetadata,
};

export const RETURN_URL = "https://www.example.com/southwark/apply/published";

export const mockReturnURLContext = ({
  flow = { slug: "apply", team: { slug: "southwark", domain: null } },
  session = { flowId: validBody.flowId, email: null },
}: {
  flow?: {
    slug: string;
    team: { slug: string; domain: string | null };
  } | null;
  session?: {
    flowId: string;
    email: string | null;
    lockedAt?: string | null;
  } | null;
} = {}) =>
  queryMock.mockQuery({
    name: "GetCheckoutReturnURLContext",
    matchOnVariables: false,
    data: { flow, session: session && { lockedAt: null, ...session } },
  });

export const mockPassportLookup = (passportData: unknown) =>
  queryMock.mockQuery({
    name: "GetCheckoutSessionPassportData",
    matchOnVariables: false,
    data: { session: { passportData } },
  });

export const mockInitiatedCheckoutSessions = (
  checkoutSessionIds: string[] = [],
) =>
  queryMock.mockQuery({
    name: "GetInitiatedCheckoutSessions",
    matchOnVariables: false,
    data: {
      paymentStatus: checkoutSessionIds.map((stripePaymentId) => ({
        stripePaymentId,
      })),
    },
  });

// A £145 total made up of a £121 application fee + £24 (incl. VAT) service charge
export const feeBreakdownPassport = {
  "application.fee.calculated": 121,
  "application.fee.payable": 145,
  "application.fee.serviceCharge": 40,
  "application.fee.serviceCharge.VAT": 8,
  "application.fee.payable.VAT": 8,
} satisfies Partial<PassportFeeFields>;

/**
 * A team ready to take Stripe payments, for a session with no previous Checkout Sessions
 */
export const mockCreateCheckoutSessionDefaults = () => {
  mockCreate.mockReset();
  mockCreate.mockResolvedValue({
    id: "cs_test_a1b2c3",
    url: "https://checkout.stripe.com/c/pay/cs_test_a1b2c3",
  });
  mockRetrieve.mockReset();
  mockExpire.mockReset().mockResolvedValue({ status: "expired" });
  mockGetTeamBySlug.mockReset().mockResolvedValue(stripeTeam);
  mockGetStripeAccountId.mockReset().mockResolvedValue(STRIPE_ACCOUNT_ID);
  mockIsAccountReadyForPayments.mockReset().mockResolvedValue(true);
  mockPassportLookup(feeBreakdownPassport);
  mockReturnURLContext();
  mockPaymentStatusInsert();
  mockInitiatedCheckoutSessions();
};

export const PAYMENT_REQUEST_ID = "3d5a1b8e-6f0c-4b7a-9e2d-1c4f8a7b6e5d";

export const PAYEE_EMAIL = "payee@example.com";

export const paymentRequestFeeBreakdown = {
  amount: {
    calculated: 121,
    calculatedVAT: 0,
    payable: 145,
    payableVAT: 8,
    fastTrack: 0,
    fastTrackVAT: 0,
    serviceCharge: 40,
    serviceChargeVAT: 8,
    paymentProcessing: 0,
    paymentProcessingVAT: 0,
    reduction: 0,
    reductionVAT: 0,
    exemption: 0,
    exemptionVAT: 0,
  },
  reductions: [],
  exemptions: [],
};

export const paymentRequestMetadataConfig = [
  { key: "flow", value: "Apply for planning permission", type: "static" },
  { key: "source", value: "PlanX", type: "static" },
  { key: "paidViaInviteToPay", value: "paidViaInviteToPay", type: "data" },
  { key: "propertyType", value: "property.type", type: "data" },
];

export const buildPaymentRequest = (
  overrides: Record<string, unknown> = {},
  sessionOverrides: Record<string, unknown> = {},
) => ({
  id: PAYMENT_REQUEST_ID,
  sessionId: validBody.sessionId,
  payeeEmail: PAYEE_EMAIL,
  feeBreakdown: paymentRequestFeeBreakdown,
  stripeMetadata: paymentRequestMetadataConfig,
  createdAt: subDays(new Date(), 1).toISOString(),
  paidAt: null,
  govPayPaymentId: null,
  session: {
    flowId: validBody.flowId,
    deletedAt: null,
    lockedAt: subDays(new Date(), 1).toISOString(),
    passport: { data: { "property.type": ["house.semiDetached"] } },
    flow: { slug: "apply", team: { slug: "southwark", domain: null } },
    ...sessionOverrides,
  },
  ...overrides,
});

export const mockPaymentRequest = (paymentRequest: unknown) =>
  queryMock.mockQuery({
    name: "GetPaymentRequestForCheckout",
    matchOnVariables: false,
    data: { paymentRequest },
  });

/**
 * An unpaid, unexpired payment request for a locked session
 */
export const mockCreatePaymentRequestCheckoutSessionDefaults = () => {
  mockCreateCheckoutSessionDefaults();
  mockPaymentRequest(buildPaymentRequest());
};
