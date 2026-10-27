import supertest from "supertest";

import app from "../../../server.js";
import { queryMock } from "../../../tests/graphqlQueryMock.js";
import { authHeader } from "../../../tests/mockJWT.js";

const ENDPOINT = "/stripe/migrate/southwark";

const mockTeamAndPlatformAdmin = () => {
  queryMock.mockQuery({
    name: "GetTeamBySlug",
    matchOnVariables: false,
    data: {
      teams: [
        { id: 1, slug: "southwark", settings: { paymentProvider: "govpay" } },
      ],
    },
  });
  queryMock.mockQuery({
    name: "GetUserById",
    matchOnVariables: false,
    data: { user: { id: 123, isPlatformAdmin: true, teams: [] } },
  });
};

const mockMigrationChecks = (accountId: string | null) => {
  queryMock.mockQuery({
    name: "GetStripeAccountId",
    matchOnVariables: false,
    data: { stripeAccounts: [{ accountId }] },
  });
  queryMock.mockQuery({
    name: "GetActiveGovPaySessions",
    matchOnVariables: false,
    data: { paymentStatuses: [] },
  });
};

const mockUpdatePaymentProvider = (affectedRows = 1) => {
  queryMock.mockQuery({
    name: "UpdatePaymentProvider",
    matchOnVariables: false,
    data: { updateTeamPaymentProvider: { affectedRows } },
  });
};

// Any unmocked request (e.g. a payment_provider mutation) fails the request, so these are the only calls made
const READ_ONLY_OPERATIONS = [
  "IsTokenRevoked",
  "GetTeamBySlug",
  "GetUserById",
  "GetStripeAccountId",
  "GetActiveGovPaySessions",
];

const getCalledOperations = () =>
  queryMock
    .getCalls()
    .map(({ id }) => id)
    .sort();

beforeEach(() => {
  mockTeamAndPlatformAdmin();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("migrating to Stripe in production, before Stripe payments go live", () => {
  beforeEach(() => {
    vi.stubEnv("APP_ENVIRONMENT", "production");
  });

  it("refuses with a 409, without changing the team's payment provider", async () => {
    mockMigrationChecks("acct_live_southwark");

    await supertest(app)
      .post(ENDPOINT)
      .set(authHeader({ role: "teamEditor" }))
      .expect(409)
      .then((res) => {
        expect(res.body).toEqual({
          canMigrate: false,
          blockers: [{ reason: "stripePaymentsNotEnabled" }],
        });
      });

    expect(getCalledOperations()).toEqual([...READ_ONLY_OPERATIONS].sort());
  });

  it("reports the go-live blocker alongside any others", async () => {
    mockMigrationChecks(null);

    await supertest(app)
      .post(ENDPOINT)
      .set(authHeader({ role: "teamEditor" }))
      .expect(409)
      .then((res) => {
        expect(res.body.blockers).toEqual([
          { reason: "stripePaymentsNotEnabled" },
          { reason: "stripeNotConnected" },
        ]);
      });
  });
});

describe.each(["staging", "development"])(
  "migrating to Stripe in %s",
  (environment) => {
    beforeEach(() => {
      vi.stubEnv("APP_ENVIRONMENT", environment);
    });

    it("is not blocked by the go-live switch", async () => {
      mockMigrationChecks("acct_test_southwark");
      mockUpdatePaymentProvider(1);

      await supertest(app)
        .post(ENDPOINT)
        .set(authHeader({ role: "teamEditor" }))
        .then((res) => {
          expect(res.body.blockers).toEqual([]);
        });
    });

    it("still reports the other blockers", async () => {
      mockMigrationChecks(null);
      mockUpdatePaymentProvider(1);

      await supertest(app)
        .post(ENDPOINT)
        .set(authHeader({ role: "teamEditor" }))
        .expect(409)
        .then((res) => {
          expect(res.body.blockers).toEqual([{ reason: "stripeNotConnected" }]);
        });
    });
  },
);
