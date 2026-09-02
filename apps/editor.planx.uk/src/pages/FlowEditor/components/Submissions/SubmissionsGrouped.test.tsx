import { screen } from "@testing-library/react";
import { graphql, HttpResponse } from "msw";
import React from "react";
import server from "test/mockServer";
import { setup } from "test/utils";
import { it } from "vitest";

import EventsLogGrouped from "./components/EventsLogGrouped";
import { mockSubmissionsGroupedAllStatuses } from "./mockSubmissionsGrouped";

const handlers = [
  graphql.query("GetSubmissions", () =>
    HttpResponse.json({
      data: { submissions: mockSubmissionsGroupedAllStatuses },
    }),
  ),
];

beforeEach(() => {
  server.use(...handlers);
});

describe("When the submissions log renders", () => {
  beforeEach(async () => {
    await setup(
      <EventsLogGrouped
        submissions={mockSubmissionsGroupedAllStatuses}
        error={undefined}
        loading={false}
      />,
    );
  });

  it("shows the expected headers", () => {
    const headers = ["Service", "Address", "Status", "Date", "Session ID"];
    headers.map((header) =>
      expect(
        screen.getByRole("columnheader", { name: header }),
      ).toBeInTheDocument(),
    );
  }, 20_000);

  it("renders the expected session IDs", () => {
    const expectedSessionIds = [
      "126ec0c4-12f2-1209-aa09-11294ec3ee12", // sendToEmailSuccessSummary
      "6fcb873f-cc7f-4fc0-ad9d-b4148de7a3b5", // invitedToPaySummary
      "1a2b3c4d-1111-4aaa-8aaa-111111111111", // paymentInProgressSummary
      "1a2b3c4d-2222-4aaa-8aaa-222222222222", // sendingSummary
      "556ec0c4-55f2-7709-aa09-15599ec3ee99", // sendToBOPSFailureSummary
      "1a2b3c4d-3333-4aaa-8aaa-333333333333", // sendToUniformFailureSummary
      "1a2b3c4d-4444-4aaa-8aaa-444444444444", // sendToEmailFailureSummary
      "1a2b3c4d-5555-4aaa-8aaa-555555555555", // uploadToAWSFailureSummary
      "1a2b3c4d-6666-4aaa-8aaa-666666666666", // submitToIdoxFailureSummary
      "1a2b3c4d-7777-4aaa-8aaa-777777777777", // sanitisedApplicationSummary
      "aaaaaaaa-4444-4aaa-8aaa-444444444444", // noAddressSendToEmailSummary
    ];

    expectedSessionIds.forEach((sessionId) => {
      expect(screen.getByRole("gridcell", { name: sessionId })).toBeVisible();
    });
  }, 20_000);

  it("correctly renders statuses", () => {
    const expectedStatusCounts = {
      Success: 3, // sendToEmailSuccessSummary, noAddressSendToEmailSummary, sanitisedApplicationSummary
      "Invited to pay": 1,
      "Payment in progress": 1,
      Sending: 1,
      "Submit to BOPS failed": 1,
      "Submit to Uniform failed": 1,
      "Send to email failed": 1,
      "Upload to AWS S3 failed": 1,
      "Submit to Idox Nexus failed": 1,
    };

    Object.entries(expectedStatusCounts).forEach(([status, count]) => {
      expect(screen.getAllByRole("gridcell", { name: status })).toHaveLength(
        count,
      );
    });
  }, 20_000);

  it("correctly renders flow names", () => {
    const expectedFlowNameCounts: Record<string, number> = {
      "Dsn impact metrics": 1,
      "Apply for planning permission": 4, // invitedToPay, paymentInProgress, sending, sanitised
      "Apply for a lawful development certificate": 3, // BOPS, AWS, Idox failures
      "Report a breach": 2, // Uniform + email failures
      "Attend a Public Inquiry": 1,
    };

    Object.entries(expectedFlowNameCounts).forEach(([flowName, count]) => {
      expect(screen.getAllByText(flowName)).toHaveLength(count);
    });
  }, 20_000);

  it("correctly renders addresses", () => {
    // including "Not applicable" and "No longer retained" cases
    expect(
      screen.getByRole("gridcell", {
        name: "1, CALVERT AVENUE, COLINDALE, LONDON, BARNET, NW9 4EW",
      }),
    ).toBeVisible();
    expect(
      screen.getByRole("gridcell", { name: "Not applicable" }),
    ).toBeVisible();
    expect(
      screen.getByRole("gridcell", { name: "No longer retained" }),
    ).toBeVisible();
  }, 20_000);
});
