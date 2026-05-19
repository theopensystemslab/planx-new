import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import InputAdornment from "@mui/material/InputAdornment";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { createFileRoute } from "@tanstack/react-router";
import apiClient from "lib/api/client";
import PublicLayout from "pages/layout/PublicLayout";
import React, { useState } from "react";

export const Route = createFileRoute("/_public/_planXDomain/stripe-test/")({
  component: PayView,
});

const CARD_FEE_PERCENT = 0.05;
const BACS_FEE_PENCE = 400;

const fmt = (pence: number) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(
    pence / 100,
  );

function PayView() {
  const [loading, setLoading] = useState<"card" | "bacs" | null>(null);
  const [fields, setFields] = useState({
    amountPounds: "206.00",
    applicantName: "Test Applicant",
    address: "1 Test Street, London, SE1 7PB",
    applicationType: "Lawful Development Certificate - Existing",
    council: "southwark",
    flow: "apply-for-a-lawful-development-certificate",
    sessionId: "test-session-abc123",
    connectedAccountId: "acct_1TYMQfEJh4JGcbG7",
  });

  const set =
    (key: keyof typeof fields) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setFields((f) => ({ ...f, [key]: e.target.value }));

  const amountPence = Math.round(parseFloat(fields.amountPounds || "0") * 100);
  const cardFee = Math.round(amountPence * CARD_FEE_PERCENT);
  const bacsFee = BACS_FEE_PENCE;
  const isValid = amountPence > 0;

  const metadata = {
    source: "PlanX",
    flow: fields.flow,
    council: fields.council,
    application_type: fields.applicationType,
    property_address: fields.address,
    applicant_name: fields.applicantName,
    session_id: fields.sessionId,
  };

  const handlePay = async (method: "card" | "bacs") => {
    setLoading(method);
    const serviceCharge = method === "card" ? cardFee : bacsFee;
    const paymentMethodTypes: ("card" | "bacs_debit")[] =
      method === "card" ? ["card"] : ["bacs_debit"];
    const { data } = await apiClient.post<{ url: string }>(
      "/pay/stripe/checkout-session",
      {
        amount: amountPence,
        serviceCharge,
        paymentMethodTypes,
        metadata,
        ...(fields.connectedAccountId
          ? { connectedAccountId: fields.connectedAccountId }
          : {}),
      },
    );
    window.location.href = data.url;
  };

  return (
    <PublicLayout>
      <Stack spacing={3} sx={{ maxWidth: 760, mx: "auto", py: 4 }}>
        <Box>
          <Chip label="TEST MODE" color="warning" size="small" sx={{ mb: 1 }} />
          <Typography variant="h2">Pay your application fee</Typography>
        </Box>

        <Box sx={{ border: "1px solid", borderColor: "divider", p: 2 }}>
          <Typography variant="h4" gutterBottom>
            Application details
          </Typography>
          <Stack spacing={2}>
            <TextField
              label="Amount"
              value={fields.amountPounds}
              onChange={set("amountPounds")}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">£</InputAdornment>
                  ),
                },
              }}
              inputMode="decimal"
              size="small"
            />
            <TextField
              label="Applicant name"
              value={fields.applicantName}
              onChange={set("applicantName")}
              size="small"
            />
            <TextField
              label="Property address"
              value={fields.address}
              onChange={set("address")}
              size="small"
            />
            <TextField
              label="Application type"
              value={fields.applicationType}
              onChange={set("applicationType")}
              size="small"
            />
            <TextField
              label="Council"
              value={fields.council}
              onChange={set("council")}
              size="small"
            />
            <TextField
              label="Flow"
              value={fields.flow}
              onChange={set("flow")}
              size="small"
            />
            <TextField
              label="Session ID"
              value={fields.sessionId}
              onChange={set("sessionId")}
              size="small"
            />
            <TextField
              label="Connected account ID"
              placeholder="acct_..."
              value={fields.connectedAccountId}
              onChange={set("connectedAccountId")}
              size="small"
            />
          </Stack>
        </Box>

        <Box sx={{ border: "1px solid", borderColor: "divider", p: 2 }}>
          <Stack spacing={2}>
            <Button
              variant="contained"
              color="success"
              size="large"
              fullWidth
              onClick={() => handlePay("card")}
              disabled={loading !== null || !isValid}
              sx={{ justifyContent: "space-between", px: 1, gap: 2 }}
            >
              <span>
                {loading === "card" ? "Connecting..." : "Pay with credit card"}
              </span>
              <span>
                {fmt(cardFee)} fee · Total {fmt(amountPence + cardFee)}
              </span>
            </Button>

            <Button
              variant="contained"
              color="success"
              size="large"
              fullWidth
              onClick={() => handlePay("bacs")}
              disabled={loading !== null || !isValid}
              sx={{ justifyContent: "space-between", px: 1, gap: 2 }}
            >
              <span>
                {loading === "bacs"
                  ? "Connecting..."
                  : "Pay with BACS bank transfer"}
              </span>
              <span>
                {fmt(bacsFee)} fee · Total {fmt(amountPence + bacsFee)}
              </span>
            </Button>

            <Box
              sx={{
                bgcolor: "grey.100",
                p: 1.5,
                borderLeft: "4px solid",
                borderColor: "info.main",
              }}
            >
              <Typography variant="caption">
                Test card: <strong>4000 0082 6000 0000</strong> · any future
                date · any CVC
              </Typography>
            </Box>
            <Box
              sx={{
                bgcolor: "grey.100",
                p: 1.5,
                borderLeft: "4px solid",
                borderColor: "info.main",
              }}
            >
              <Typography variant="caption">
                Test BACS account (shown in placeholder):{" "}
                <strong>00012345 / 10-88-00</strong>
              </Typography>
            </Box>
            <Box
              sx={{
                bgcolor: "grey.100",
                p: 1.5,
                borderLeft: "4px solid",
                borderColor: "info.main",
              }}
            >
              <Typography variant="caption">
                More test details:
                https://docs.stripe.com/testing?locale=en-GB&testing-method=card-numbers&payment-method=bacs-direct-debit
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Divider />

        <Box>
          <Typography variant="h4" gutterBottom>
            Metadata attached to charge
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "text.secondary" }}
            gutterBottom
          >
            This is what will appear on the council's Stripe Dashboard for
            reconciliation.
          </Typography>
          <Box
            component="pre"
            sx={{
              bgcolor: "grey.100",
              p: 2,
              fontSize: "0.8rem",
              overflow: "auto",
              fontFamily: "monospace",
            }}
          >
            {JSON.stringify(metadata, null, 2)}
          </Box>
        </Box>
      </Stack>
    </PublicLayout>
  );
}
