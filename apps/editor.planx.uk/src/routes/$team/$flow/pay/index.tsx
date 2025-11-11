import { createFileRoute } from "@tanstack/react-router";
import React from "react";

export const Route = createFileRoute("/$team/$flow/pay/")({
  component: PayIndexComponent,
});

function PayIndexComponent() {
  return (
    <div>
      <h1>Payment Page</h1>
      <p>Payment functionality will be implemented here.</p>
      <p>This route handles payment processing for the flow.</p>
    </div>
  );
}
