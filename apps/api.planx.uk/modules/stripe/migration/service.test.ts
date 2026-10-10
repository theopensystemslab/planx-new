import * as connectService from "../connect/service.js";
import { getStripeAccountId } from "../connect/service.js";
import * as migrationService from "./service.js";
import {
  getActiveGovPaySessions,
  getMigrationBlockers,
  migrateToStripe,
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
  { paymentId: "7777", status: "created" },
  { paymentId: "7777", status: "error" },
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

    const result = await getMigrationBlockers(1, "team");

    expect(result).toEqual({ canMigrate: true, blockers: [] });
  });

  it("blocks migration when stripe isn't connected", async () => {
    vi.spyOn(connectService, "getStripeAccountId").mockResolvedValue(null);
    vi.spyOn(migrationService, "getActiveGovPaySessions").mockResolvedValue(0);

    const result = await getMigrationBlockers(1, "team");

    expect(result.canMigrate).toBe(false);
    expect(result.blockers).toEqual([{ reason: "stripeNotConnected" }]);
  });

  it("blocks migration when active govpay sessions are found", async () => {
    vi.spyOn(connectService, "getStripeAccountId").mockResolvedValue(
      "acct_abc",
    );
    vi.spyOn(migrationService, "getActiveGovPaySessions").mockResolvedValue(2);

    const result = await getMigrationBlockers(1, "team");

    expect(result.canMigrate).toBe(false);
    expect(result.blockers).toEqual([
      { reason: "activeGovpaySessions", count: 2 },
    ]);
  });

  it("returns multiple blockers when they exist", async () => {
    vi.spyOn(connectService, "getStripeAccountId").mockResolvedValue(null);
    vi.spyOn(migrationService, "getActiveGovPaySessions").mockResolvedValue(1);

    const result = await getMigrationBlockers(1, "team");

    expect(result.canMigrate).toBe(false);
    expect(result.blockers).toEqual(
      expect.arrayContaining([
        { reason: "stripeNotConnected" },
        { reason: "activeGovpaySessions", count: 1 },
      ]),
    );
    expect(result.blockers).toHaveLength(2);
  });

  it("returns no blockers when migration can proceed", async () => {
    vi.spyOn(connectService, "getStripeAccountId").mockResolvedValue("111222");
    vi.spyOn(migrationService, "getActiveGovPaySessions").mockResolvedValue(0);

    const result = await getMigrationBlockers(1, "team");

    expect(result.canMigrate).toBe(true);
    expect(result.blockers).toEqual([]);
    expect(result.blockers).toHaveLength(0);
  });
});

describe("migrateToStripe", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  // TODO(stripe-migration): migrateToStripe is a placeholder — it always reports
  // `canMigrate: false` for now (so that the frontend never shows a misleading "Migrated to Stripe" success state).
  // Replace with a test asserting `canMigrate: true` once the actual migration (and updatePaymentProvider call) is implemented.
  it("returns no blockers when migration succeeds", async () => {
    vi.spyOn(connectService, "getStripeAccountId").mockResolvedValue(
      "acct_abc",
    );
    vi.spyOn(migrationService, "getActiveGovPaySessions").mockResolvedValue(0);

    const result = await migrateToStripe(1, "team");

    expect(result).toEqual({ canMigrate: false, blockers: [] });
  });

  it("returns blockers when migration cannot proceed", async () => {
    vi.spyOn(connectService, "getStripeAccountId").mockResolvedValue(null);
    vi.spyOn(migrationService, "getActiveGovPaySessions").mockResolvedValue(0);

    const result = await migrateToStripe(1, "team");

    expect(result.canMigrate).toBe(false);
    expect(result.blockers).toEqual([{ reason: "stripeNotConnected" }]);
  });
});
