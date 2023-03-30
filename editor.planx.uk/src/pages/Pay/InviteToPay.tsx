import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import React from "react";

import type { PaymentRequest } from "./types";

const InviteToPay: React.FC<PaymentRequest> = ({
  sessionPreviewData,
  createdAt,
  paymentRequestId,
}) => {
  return (
    <Box>
      <Typography variant="h1" gutterBottom>
        Nominate to pay
      </Typography>
      <Typography variant="body1">
        {JSON.stringify(sessionPreviewData, null, 4)}
      </Typography>
    </Box>
  );
};

export default InviteToPay;
