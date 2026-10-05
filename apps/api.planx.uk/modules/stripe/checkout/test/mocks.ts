import type { PassportFeeFields } from "@opensystemslab/planx-core/types";

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
  session?: { flowId: string; email: string | null } | null;
} = {}) =>
  queryMock.mockQuery({
    name: "GetCheckoutReturnURLContext",
    matchOnVariables: false,
    data: { flow, session },
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
