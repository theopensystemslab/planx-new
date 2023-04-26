import Check from "@mui/icons-material/Check";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import { lighten, styled, useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import type { PaymentRequest } from "@opensystemslab/planx-core/types";
import { getExpiryDateForPaymentRequest } from "lib/pay";
import React from "react";
import Banner from "ui/Banner";

const List = styled("ul")(({ theme }) => ({
  fontSize: theme.typography.body2.fontSize,
}));

const InviteToPay: React.FC<PaymentRequest> = ({ createdAt }) => {
  const theme = useTheme();
  const expiryDate = getExpiryDateForPaymentRequest(createdAt);

  return (
    <>
      <Banner
        Icon={Check}
        iconTitle={"Success"}
        heading="Payment invitation sent"
        color={{
          background: lighten(theme.palette.success.main, 0.9),
          text: "black",
        }}
      >
        <Typography pt={2} variant="body2">
          A payment invitation has been sent to your nominee. You will receive
          an email to confirm when the payment has been completed.
        </Typography>
      </Banner>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h3" component="h2" pb={2}>
          You will be contacted
        </Typography>
        <List>
          <li>if your nominee fails to make payment by {expiryDate}</li>
          <li>
            if there is anything missing from the information you have provided
            so far
          </li>
          <li>if any additional information is required</li>
          <li>to arrange a site visit, if required</li>
          <li>to inform you whether a certificate has been granted or not</li>
        </List>
        <Divider sx={{ pt: 2 }} />
        <Typography variant="h3" component="h2" pt={4} pb={2}>
          Contact us
        </Typography>
        <List>
          <li>
            if you do not receive an email confirming that we have received your
            application within 24 hours or the next working day
          </li>
          <li>
            if you have any questions about your application or this service
          </li>
        </List>
        {/* TODO: Get this from team data (store?) */}
        <Box pt={2}>
          <Typography variant="body2" sx={{ margin: 0 }}>
            <b>Telephone</b> 0300 131 6000
          </Typography>
          <Typography variant="body2" sx={{ margin: 0 }}>
            Monday to Thursday, 9am - 5.30pm (except public holidays)
          </Typography>
        </Box>
        <Box pt={2}>
          <b>Email</b>{" "}
          <a href="mailto:planning.digital@buckinghamshire.gov.uk">
            planning.digital@buckinghamshire.gov.uk
          </a>
          <Typography variant="body2" sx={{ margin: 0 }}>
            We aim to respond within 2 working days.
          </Typography>
        </Box>
      </Container>
    </>
  );
};

export default InviteToPay;
