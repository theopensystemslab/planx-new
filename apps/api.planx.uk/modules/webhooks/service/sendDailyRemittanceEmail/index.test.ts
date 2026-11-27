import { format, subDays } from "date-fns";
import supertest from "supertest";

import { NOTIFY_TEST_EMAIL } from "../../../../lib/notify/utils.js";
import type * as resend from "../../../../lib/resend/index.js";
import { sendEmail } from "../../../../lib/resend/index.js";
import app from "../../../../server.js";
import { queryMock } from "../../../../tests/graphqlQueryMock.js";

const mockDailyRemittanceOne = [
  {
    fee: 100,
    feeVat: 20,
    eventId: "evt_1UfMc7EAzmRwH26v1LTz1xYz",
    flowSlug: "apply-for-planning-permission",
    paidAt: subDays(new Date(), 1),
    paymentId: "pi_1UfMc7EAzmRwH26v1FTmrXYz",
    paymentMethod: "card",
    serviceCharge: 40,
    serviceChargeVat: 8,
    sessionId: "1b11b111-b580-43b1-b621-000f53c35647",
    teamSlug: "testing",
  },
];

const mockTeamInvoiceDetailsOne = {
  teams: [
    {
      name: "Testing",
      invoiceDetails: {
        emailAddress: NOTIFY_TEST_EMAIL,
      },
    },
  ],
};

const mockTeamInvoiceDetailsTwo = {
  teams: [
    {
      name: "Example team 2",
      invoiceDetails: {
        emailAddress: NOTIFY_TEST_EMAIL.concat("2"),
      },
    },
  ],
};

const mockDailyRemittanceMultiple = [
  ...mockDailyRemittanceOne,
  {
    fee: 200,
    feeVat: 0,
    eventId: "evt_2UfMc7EAzmRwH26v1LTz2xYz",
    flowSlug: "apply-for-planning-permission",
    paidAt: subDays(new Date(), 1),
    paymentId: "pi_2UfMc7EAzmRwH26v1FTmrXYz",
    paymentMethod: "card",
    serviceCharge: 40,
    serviceChargeVat: 8,
    sessionId: "2b22b222-b580-43b1-b621-000f53c35647",
    teamSlug: "testing",
  },
  {
    fee: 300,
    feeVat: 0,
    eventId: "evt_3UfMc7EAzmRwH26v1LTz3xYz",
    flowSlug: "apply-for-planning-permission",
    paidAt: subDays(new Date(), 1),
    paymentId: "pi_2UfMc7EAzmRwH26v1FTmrXYz",
    paymentMethod: "card",
    serviceCharge: 40,
    serviceChargeVat: 8,
    sessionId: "3b33b333-b580-43b1-b621-000f53c35647",
    teamSlug: "testing",
  },
  {
    fee: 400,
    feeVat: 0,
    eventId: "evt_4UfMc7EAzmRwH26v1LTz4xYz",
    flowSlug: "apply-for-planning-permission",
    paidAt: subDays(new Date(), 1),
    paymentId: "pi_2UfMc7EAzmRwH26v1FTmrXYz",
    paymentMethod: "card",
    serviceCharge: 40,
    serviceChargeVat: 8,
    sessionId: "4b44b444-b580-43b1-b621-000f53c35647",
    teamSlug: "another-council",
  },
];

vi.mock("../../../../lib/resend/index.js", async (importOriginal) => ({
  ...(await importOriginal<typeof resend>()),
  sendEmail: vi.fn(),
}));

describe("'remittance' template (Resend)", () => {
  const REMITTANCE_ENDPOINT = "/webhooks/hasura/send-daily-remittance-emails";
  const formattedDate = format(subDays(new Date(), 1), "dd/MM/yyyy");

  beforeEach(() => {
    vi.mocked(sendEmail).mockClear();
    queryMock.reset();
    queryMock.mockQuery({
      name: "GetDailyRemittance",
      data: { dailyRemittance: mockDailyRemittanceOne },
      matchOnVariables: false,
    });
    queryMock.mockQuery({
      name: "GetTeamEmailDetails",
      data: mockTeamInvoiceDetailsOne,
      matchOnVariables: false,
    });
    vi.stubEnv("APP_ENVIRONMENT", "production");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns 401 if no auth header is provided", async () => {
    await supertest(app).post(REMITTANCE_ENDPOINT).expect(401);

    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("sends a remittance email when authorised", async () => {
    await supertest(app)
      .post(REMITTANCE_ENDPOINT)
      .set({ Authorization: process.env.HASURA_PLANX_API_KEY! })
      .expect(200);

    expect(sendEmail).toHaveBeenCalled();
  });

  it("attaches a CSV of transactions to the remittance email", async () => {
    await supertest(app)
      .post(REMITTANCE_ENDPOINT)
      .set({ Authorization: process.env.HASURA_PLANX_API_KEY! })
      .expect(200);

    expect(sendEmail).toHaveBeenCalledWith(
      "remittance",
      NOTIFY_TEST_EMAIL,
      expect.any(Object),
      expect.objectContaining({
        attachments: [
          expect.objectContaining({
            filename: `testing-remittance-${formattedDate}.csv`,
            content: expect.any(Buffer),
          }),
        ],
      }),
    );

    const options = vi.mocked(sendEmail).mock.calls[0][3];
    const content = options?.attachments?.[0].content ?? "";
    const csv = content.toString();
    expect(csv).toContain(
      "Paid at,Session ID,Payment ID,Service,Fee (£),Fee VAT (£),Service charge (£),Service charge VAT (£),Payment method",
    );
    expect(csv).toContain(
      "1b11b111-b580-43b1-b621-000f53c35647,pi_1UfMc7EAzmRwH26v1FTmrXYz,apply-for-planning-permission,100.00,20.00,40.00,8.00,card",
    );
    expect(csv).toContain(format(subDays(new Date(), 1), "yyyy-MM-dd"));
  });

  it("sends one email per team when there are multiple transactions and multiple teams", async () => {
    queryMock.reset();
    queryMock.mockQuery({
      name: "GetDailyRemittance",
      data: { dailyRemittance: mockDailyRemittanceMultiple },
      matchOnVariables: false,
    });
    queryMock.mockQuery({
      name: "GetTeamEmailDetails",
      matchOnVariables: true,
      variables: { teamSlug: "testing" },
      data: mockTeamInvoiceDetailsOne,
    });
    queryMock.mockQuery({
      name: "GetTeamEmailDetails",
      matchOnVariables: true,
      variables: { teamSlug: "another-council" },
      data: mockTeamInvoiceDetailsTwo,
    });

    await supertest(app)
      .post(REMITTANCE_ENDPOINT)
      .set({ Authorization: process.env.HASURA_PLANX_API_KEY! })
      .expect(200);

    expect(sendEmail).toHaveBeenCalledTimes(2);

    // "testing" team: 3 transactions, total = (10000+20000+30000)/100
    expect(sendEmail).toHaveBeenCalledWith(
      "remittance",
      NOTIFY_TEST_EMAIL,
      expect.objectContaining({ team: "Testing", transactions: 3, total: 600 }),
      expect.any(Object),
    );

    // "another-council" team: 1 transaction, total = 40000/100
    expect(sendEmail).toHaveBeenCalledWith(
      "remittance",
      NOTIFY_TEST_EMAIL.concat("2"),
      expect.objectContaining({
        team: "Example team 2",
        transactions: 1,
        total: 400,
      }),
      expect.any(Object),
    );
  });

  it("skips sending when no invoice email is configured for a team", async () => {
    queryMock.reset();
    queryMock.mockQuery({
      name: "GetDailyRemittance",
      data: { dailyRemittance: mockDailyRemittanceOne },
      matchOnVariables: false,
    });
    queryMock.mockQuery({
      name: "GetTeamEmailDetails",
      matchOnVariables: false,
      data: {
        teams: [{ name: "Testing", invoiceDetails: { emailAddress: null } }],
      },
    });

    await supertest(app)
      .post(REMITTANCE_ENDPOINT)
      .set({ Authorization: process.env.HASURA_PLANX_API_KEY! })
      .expect(200);

    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("does not send emails on non-prod environments", async () => {
    vi.stubEnv("APP_ENVIRONMENT", "staging");

    await supertest(app)
      .post(REMITTANCE_ENDPOINT)
      .set({ Authorization: process.env.HASURA_PLANX_API_KEY! })
      .expect(200);

    expect(sendEmail).not.toHaveBeenCalled();
  });
});
