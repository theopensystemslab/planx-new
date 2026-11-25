import { stringify } from "csv-stringify/sync";
import { format, subDays } from "date-fns";
import { gql } from "graphql-request";

import { $api } from "../../../../client/index.js";
import { sendEmail } from "../../../../lib/resend/index.js";
import type { TemplateRegistry } from "../../../../lib/resend/templates/index.js";
import type { RemittanceEmailResult } from "./types.js";

type DailyRemittance = {
  // feeBreakdown and metadata are also available in the view--for now, omitting json unless requested
  teamSlug: string;
  flowSlug: string;
  sessionId: string;
  paymentId: string;
  eventId: string;
  amountInPence: number;
  paymentMethod: string;
  paidAt: string;
};

interface GetDailyRemittance {
  dailyRemittance: DailyRemittance[];
}

const getDailyRemittance = async (): Promise<DailyRemittance[]> => {
  const { dailyRemittance } = await $api.client.request<GetDailyRemittance>(
    gql`
      query GetDailyRemittance {
        dailyRemittance: stripe_daily_remittance {
          amountInPence: amount_in_pence
          eventId: event_id
          flowSlug: flow_slug
          paidAt: paid_at
          paymentId: payment_id
          paymentMethod: payment_method
          sessionId: session_id
          teamSlug: team_slug
        }
      }
    `,
    {},
  );

  return dailyRemittance;
};

interface GetTeamEmailDetails {
  teams: {
    name: string;
    invoiceDetails: {
      emailAddress: string;
    };
  }[];
}

type TeamEmailDetails = {
  name: string;
  emailAddress: string;
};

const getTeamEmailDetails = async (
  teamSlug: string,
): Promise<TeamEmailDetails> => {
  const { teams } = await $api.client.request<GetTeamEmailDetails>(
    gql`
      query GetTeamEmailDetails($teamSlug: String!) {
        teams(where: { slug: { _eq: $teamSlug } }) {
          name
          invoiceDetails: invoice_details {
            emailAddress: email_address
          }
        }
      }
    `,
    { teamSlug },
  );

  const name = teams[0].name;
  const emailAddress = teams[0].invoiceDetails.emailAddress;
  return { name, emailAddress };
};

const buildCsv = (transactions: DailyRemittance[]): string => {
  const rows = transactions.map((t) => ({
    paidAt: t.paidAt,
    sessionId: t.sessionId,
    paymentId: t.paymentId,
    flowSlug: t.flowSlug,
    amount: (t.amountInPence / 100).toFixed(2),
    paymentMethod: t.paymentMethod,
  }));

  return stringify(rows, {
    header: true,
    columns: [
      { key: "paidAt", header: "Paid at" },
      { key: "sessionId", header: "Session ID" },
      { key: "paymentId", header: "Payment ID" },
      { key: "flowSlug", header: "Service" },
      { key: "amount", header: "Amount (£)" },
      { key: "paymentMethod", header: "Payment method" },
    ],
  });
};

const sendRemittanceEmail = async (
  teamSlug: string,
  transactions: DailyRemittance[],
) => {
  const { name, emailAddress } = await getTeamEmailDetails(teamSlug);
  if (!emailAddress) {
    console.warn(
      `No invoice email configured for team ${teamSlug}, skipping remittance`,
    );
    return;
  }

  const total = Number(
    (transactions.reduce((sum, t) => sum + t.amountInPence, 0) / 100).toFixed(
      2,
    ),
  );
  const csv = buildCsv(transactions);
  const variables: TemplateRegistry["remittance"]["variables"] = {
    date: format(subDays(new Date(), 1), "dd/MM/yyyy"),
    team: name,
    total,
    transactions: transactions.length,
  };

  const sendEmailResult = await sendEmail(
    "remittance",
    emailAddress,
    variables,
    {
      attachments: [
        {
          filename: `${teamSlug}-remittance-${variables.date}.csv`,
          content: Buffer.from(csv),
        },
      ],
    },
  );

  return sendEmailResult.message;
};

export const sendRemittanceEmailPerCouncil = async (): Promise<
  RemittanceEmailResult[]
> => {
  const dailyRemittance = await getDailyRemittance();
  const teamSlugs = [
    ...new Set(dailyRemittance.map((transaction) => transaction.teamSlug)),
  ];
  const results = await Promise.allSettled(
    teamSlugs.map((teamSlug) =>
      sendRemittanceEmail(
        teamSlug,
        dailyRemittance.filter((t) => t.teamSlug === teamSlug),
      ),
    ),
  );

  return results.map((result, i) => {
    const teamSlug = teamSlugs[i];
    if (result.status === "fulfilled") {
      return { teamSlug, status: result.value ? "sent" : "skipped" };
    }
    console.error(
      `Failed to send remittance email for ${teamSlug}`,
      result.reason,
    );
    return {
      teamSlug,
      status: "failed",
      error: String(result.reason),
    };
  });
};
