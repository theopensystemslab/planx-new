import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { createFileRoute, useSearch } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import apiClient from "lib/api/client";
import PublicLayout from "pages/layout/PublicLayout";
import React, { useEffect, useState } from "react";
import { z } from "zod";

const searchSchema = z.object({
  session_id: z.string().optional(),
});

export const Route = createFileRoute(
  "/_public/_planXDomain/stripe-test/success",
)({
  validateSearch: zodValidator(searchSchema),
  component: StripeTestSuccess,
});

interface SessionDetails {
  paymentIntentId: string | null;
  stripeUrl: string | null;
}

function StripeTestSuccess() {
  const { session_id } = useSearch({ from: Route.id });
  const [details, setDetails] = useState<SessionDetails | null>(null);

  useEffect(() => {
    if (!session_id) return;
    apiClient
      .get<SessionDetails>(`/pay/stripe/session/${session_id}`)
      .then(({ data }) => setDetails(data))
      .catch(() => setDetails({ paymentIntentId: null, stripeUrl: null }));
  }, [session_id]);

  return (
    <PublicLayout>
      <Stack spacing={3} sx={{ maxWidth: 640, mx: "auto", py: 4 }}>
        <Box
          sx={{ borderLeft: "6px solid", borderColor: "success.main", pl: 2 }}
        >
          <Typography variant="h2" gutterBottom>
            Payment successful
          </Typography>
        </Box>

        <Box sx={{ border: "1px solid", borderColor: "divider", p: 3 }}>
          {!details ? (
            <CircularProgress size={20} />
          ) : (
            <Stack spacing={1}>
              <Typography variant="body2">
                <strong>Session ID</strong>
                <br />
                <code>{session_id}</code>
              </Typography>
              {details.paymentIntentId && (
                <Typography variant="body2">
                  <strong>Payment ID</strong>
                  <br />
                  <code>{details.paymentIntentId}</code>
                </Typography>
              )}
              {details.stripeUrl && (
                <Link
                  href={details.stripeUrl}
                  target="_blank"
                  rel="noreferrer"
                  variant="body2"
                >
                  View payment in Stripe Dashboard ↗
                </Link>
              )}
            </Stack>
          )}
        </Box>

        <Button
          variant="outlined"
          href="/stripe-test"
          sx={{ alignSelf: "flex-start" }}
        >
          Run another test
        </Button>
      </Stack>
    </PublicLayout>
  );
}
