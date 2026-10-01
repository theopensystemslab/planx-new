import * as connectService from "../connect/service.js";
import { getStripeAccountId } from "../connect/service.js";
import * as migrationService from "./service.js";
import {
  getActiveGovPaySessions,
  getMigrationBlockers,
  isCheckoutConfigured,
} from "./service.js";

const mockRequest = vi.fn();

vi.mock("../../../client/index.js", () => ({
  $api: {
    client: { request: (...args: unknown[]) => mockRequest(...args) },
  },
}));

const mockActiveSessions = [
  { paymentId: "1111", status: "created" },
  { paymentId: "2222", status: "created" },
  { paymentId: "3333", status: "created" },
];

const mockFinishedSessions = [
  { paymentId: "4444", status: "created" },
  { paymentId: "4444", status: "success" },
  { paymentId: "5555", status: "created" },
  { paymentId: "5555", status: "failed" },
  { paymentId: "6666", status: "created" },
  { paymentId: "6666", status: "cancelled" },
];

describe("getActiveGovPaySessions", () => {
  afterEach(() => mockRequest.mockReset());

  it("counts active sessions", async () => {
    const mockPaymentStatuses = {
      paymentStatuses: mockActiveSessions.concat(mockFinishedSessions),
    };
    await mockRequest.mockResolvedValueOnce(mockPaymentStatuses);
    const activeSessions = getActiveGovPaySessions("team");
    await expect(activeSessions).resolves.toBe(3);
  });

  it("returns 0 if no active sessions", async () => {
    const mockPaymentStatuses = { paymentStatuses: mockFinishedSessions };
    await mockRequest.mockResolvedValueOnce(mockPaymentStatuses);
    const activeSessions = getActiveGovPaySessions("team");
    await expect(activeSessions).resolves.toEqual(0);
  });
});

// TODO block for isCheckoutConfigured
describe("isCheckoutConfigured", () => {
  it("returns true", async () => {
    const mockIsCheckoutConfigured = await isCheckoutConfigured("team");
    await expect(mockIsCheckoutConfigured).toBe(true);
  });
});

describe("getStripeAccountId", () => {
  it("returns a stripe account when set", async () => {
    mockRequest.mockResolvedValueOnce({
      teamIntegrations: [{ accountId: "acct_abc" }],
    });

    const accountId = await getStripeAccountId(42);

    expect(accountId).toBe("acct_abc");
  });

  it("returns null if no account", async () => {
    vi.stubEnv("APP_ENVIRONMENT", "staging");
    mockRequest.mockResolvedValueOnce({ teamIntegrations: [] });

    const accountId = await getStripeAccountId(42);

    expect(accountId).toBeNull();
  });
});

describe("getMigrationBlockers", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("allows migration when all conditions satisfied", async () => {
    vi.spyOn(connectService, "getStripeAccountId").mockResolvedValue(
      "acct_abc",
    );
    vi.spyOn(migrationService, "getActiveGovPaySessions").mockResolvedValue(0);
    vi.spyOn(migrationService, "isCheckoutConfigured").mockResolvedValue(true);

    const result = await getMigrationBlockers(1, "team");

    expect(result).toEqual({ canMigrate: true, blockers: [] });
  });

  it("blocks migration when stripe isn't connected", async () => {
    vi.spyOn(connectService, "getStripeAccountId").mockResolvedValue(null);
    vi.spyOn(migrationService, "getActiveGovPaySessions").mockResolvedValue(0);
    vi.spyOn(migrationService, "isCheckoutConfigured").mockResolvedValue(true);

    const result = await getMigrationBlockers(1, "team");

    expect(result.canMigrate).toBe(false);
    expect(result.blockers).toEqual([{ reason: "stripeNotConnected" }]);
  });

  it("blocks migration when active govpay sessions are found", async () => {
    vi.spyOn(connectService, "getStripeAccountId").mockResolvedValue(
      "acct_abc",
    );
    vi.spyOn(migrationService, "getActiveGovPaySessions").mockResolvedValue(2);
    vi.spyOn(migrationService, "isCheckoutConfigured").mockResolvedValue(true);

    const result = await getMigrationBlockers(1, "team");

    expect(result.canMigrate).toBe(false);
    expect(result.blockers).toEqual([
      { reason: "activeGovpaySessions", count: 2 },
    ]);
  });

  // TODO: test for failing checkout config check

  it("returns multiple blockers when they exist", async () => {
    vi.spyOn(connectService, "getStripeAccountId").mockResolvedValue(null);
    vi.spyOn(migrationService, "getActiveGovPaySessions").mockResolvedValue(1);
    vi.spyOn(migrationService, "isCheckoutConfigured").mockResolvedValue(false);

    const result = await getMigrationBlockers(1, "team");

    expect(result.canMigrate).toBe(false);
    expect(result.blockers).toEqual(
      expect.arrayContaining([
        { reason: "stripeNotConnected" },
        { reason: "activeGovpaySessions", count: 1 },
        { reason: "checkoutNotConfigured" },
      ]),
    );
    expect(result.blockers).toHaveLength(3);
  });
});
