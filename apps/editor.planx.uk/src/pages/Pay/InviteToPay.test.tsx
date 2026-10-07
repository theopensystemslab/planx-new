import { screen } from "@testing-library/react";
import { setup } from "test/utils";
import type { PublicPaymentRequest } from "utils/routeUtils/payQueries";

import InviteToPay from "./InviteToPay";

const mockPaymentRequest: PublicPaymentRequest = {
  id: "9e13f784-7299-4414-92ff-803bcacdfba8",
  paymentAmount: 12300,
  sessionPreviewData: {},
  createdAt: "2026-10-01T12:00:00.000Z",
  paidAt: null,
  govPayPaymentId: null,
  stripePaymentId: null,
};

describe("InviteToPay", () => {
  it("confirms that the invitation has been sent if the payment request has not been paid", async () => {
    await setup(<InviteToPay {...mockPaymentRequest} />);

    expect(
      await screen.findByRole("heading", { name: "Payment invitation sent" }),
    ).toBeVisible();
    expect(
      screen.getByText(
        "if your nominee fails to make payment by 29 October 2026",
      ),
    ).toBeVisible();
    expect(screen.queryByText("Payment received")).not.toBeInTheDocument();
  });

  it("confirms that the application has been sent if the payment request has been paid", async () => {
    await setup(
      <InviteToPay
        {...mockPaymentRequest}
        paidAt="2026-10-02T09:30:00.000Z"
        govPayPaymentId="govpay-ref-123"
      />,
    );

    expect(
      await screen.findByRole("heading", { name: "Payment received" }),
    ).toBeVisible();
    expect(
      screen.getByText(
        "Your nominee has made the payment. Your application has been sent.",
      ),
    ).toBeVisible();
    expect(
      screen.queryByText(/if your nominee fails to make payment/),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Print form" })).toBeVisible();
  });
});
