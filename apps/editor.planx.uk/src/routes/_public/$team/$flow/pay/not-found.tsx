import { createFileRoute } from "@tanstack/react-router";
import ErrorPage from "pages/ErrorPage/ErrorPage";
import React from "react";

export const Route = createFileRoute("/_public/$team/$flow/pay/not-found")({
  component: PaymentNotFoundComponent,
});

function PaymentNotFoundComponent() {
  return (
    <ErrorPage title="Sorry, we can't find that payment link">
      Please check you have the right link. If it still doesn't work, it may
      mean the payment link has expired or payment has already been made.
      <br />
      <br />
      Please contact the person who invited you to pay.
    </ErrorPage>
  );
}
