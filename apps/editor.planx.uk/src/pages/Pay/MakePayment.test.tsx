import { PaymentStatus } from "@opensystemslab/planx-core/types";
import { screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import server from "test/mockServer";
import { setup } from "test/utils";
import type { PublicPaymentRequest } from "utils/routeUtils/payQueries";

import MakePayment from "./MakePayment";

const mockPaymentRequest: PublicPaymentRequest = {
  id: "9e13f784-7299-4414-92ff-803bcacdfba8",
  paymentAmount: 12300,
  sessionPreviewData: {
    _address: { title: "123, Test Street, Testville" },
    "proposal.projectType": ["alter.internal"],
  },
  createdAt: "2026-10-01T12:00:00.000Z",
  paidAt: null,
  govPayPaymentId: null,
  stripePaymentId: null,
};

describe("MakePayment", () => {
  describe("when the payment request has been paid", () => {
    it("displays the payment date and reference", async () => {
      await setup(
        <MakePayment
          {...mockPaymentRequest}
          paidAt="2026-10-02T09:30:00.000Z"
          govPayPaymentId="govpay-ref-123"
        />,
      );

      expect(await screen.findByText("Payment received")).toBeVisible();
      expect(screen.getByText("Paid at")).toBeVisible();
      expect(screen.getByText("02 October 2026")).toBeVisible();
      expect(screen.getByText("Payment reference")).toBeVisible();
      expect(screen.getByText("govpay-ref-123")).toBeVisible();
      expect(screen.queryByText("Valid until")).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "Pay now" }),
      ).not.toBeInTheDocument();
    });

    it("displays a Stripe payment reference", async () => {
      await setup(
        <MakePayment
          {...mockPaymentRequest}
          paidAt="2026-10-02T09:30:00.000Z"
          stripePaymentId="pi_test_123"
        />,
      );

      expect(await screen.findByText("Payment received")).toBeVisible();
      expect(screen.getByText("pi_test_123")).toBeVisible();
    });
  });

  describe("when the payment request has not been paid", () => {
    it("allows the nominee to start a payment", async () => {
      await setup(<MakePayment {...mockPaymentRequest} />);

      expect(
        await screen.findByRole("heading", { name: "Pay", level: 1 }),
      ).toBeVisible();
      expect(screen.getByText("Fee")).toBeVisible();
      expect(screen.getByText("£123.00")).toBeVisible();
      expect(screen.getByText("Valid until")).toBeVisible();
      expect(screen.getByText("29 October 2026")).toBeVisible();
      expect(screen.getByRole("button", { name: "Pay now" })).toBeVisible();
      expect(screen.queryByText("Payment received")).not.toBeInTheDocument();
      expect(screen.queryByText("Payment reference")).not.toBeInTheDocument();
    });

    it("allows the nominee to retry a payment which is in progress", async () => {
      server.use(
        http.get("*/payment-request/:paymentRequestId/payment/:paymentId", () =>
          HttpResponse.json({
            payment_id: "govpay-ref-123",
            state: { status: PaymentStatus.created, finished: false },
            _links: { next_url: { href: "https://www.example.com" } },
          }),
        ),
      );

      await setup(
        <MakePayment
          {...mockPaymentRequest}
          govPayPaymentId="govpay-ref-123"
        />,
      );

      expect(
        await screen.findByRole("button", { name: "Retry payment" }),
      ).toBeVisible();
      expect(screen.queryByText("Payment received")).not.toBeInTheDocument();
    });
  });
});
