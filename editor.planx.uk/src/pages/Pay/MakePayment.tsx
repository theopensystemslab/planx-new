import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import React from "react";

import type { PaymentRequest } from "./types";

const MakePayment: React.FC<PaymentRequest> = ({
  sessionPreviewData,
  createdAt,
  paymentRequestId,
}) => {
  return (
    <Box>
      <Typography variant="h1" gutterBottom>
        Make a payment
      </Typography>
      <Typography variant="body1">
        {JSON.stringify(sessionPreviewData, null, 4)}
      </Typography>
    </Box>
  );
};

export default MakePayment;
