import Check from "@mui/icons-material/Check";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Link from "@mui/material/Link";
import { lighten, styled, useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import type { PaymentRequest } from "@opensystemslab/planx-core/types";
import { contentFlowSpacing } from "@planx/components/shared/Preview/Card";
import { getExpiryDateForPaymentRequest } from "lib/pay";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import Banner from "ui/public/Banner";

const List = styled("ul")(({ theme }) => ({
  fontSize: theme.typography.body2.fontSize,
}));

const FormInner = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2, 0, 4),
  "& > *": {
    ...contentFlowSpacing(theme),
  },
}));

const InviteToPay: React.FC<PaymentRequest> = ({ createdAt }) => {
  const theme = useTheme();
  const expiryDate = getExpiryDateForPaymentRequest(createdAt);
  const team = useStore((state) => state.getTeam());

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
        <Typography pt={2} variant="body2" maxWidth="formWrap">
          A payment invitation has been sent to your nominee. You will receive
          an email to confirm when the payment has been completed.
        </Typography>
      </Banner>
      <Container maxWidth="contentWrap">
        <FormInner maxWidth="formWrap">
          <Typography variant="h2" mt={2}>
            You will be contacted
          </Typography>
          <List>
            <li>if your nominee fails to make payment by {expiryDate}</li>
            <li>
              if there is anything missing from the information you have
              provided so far
            </li>
            <li>if any additional information is required</li>
            <li>to arrange a site visit, if required</li>
            <li>to inform you whether a certificate has been granted or not</li>
          </List>
          <Divider sx={{ mt: 4 }} />
          <Typography variant="h2" mt={4}>
            Contact us
          </Typography>
          <List>
            <li>
              if you have any questions about your application or this service
            </li>
          </List>
          <Box>
            <Typography variant="body2">
              <strong>Telephone</strong> {team.notifyPersonalisation?.helpPhone}
            </Typography>
            <Typography variant="body2">
              {team.notifyPersonalisation?.helpOpeningHours}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2">
              <strong>Email</strong>{" "}
              <Link href={`mailto:${team.notifyPersonalisation?.helpEmail}`}>
                {team.notifyPersonalisation?.helpEmail}
              </Link>
            </Typography>
            <Typography variant="body2">
              We aim to respond within 2 working days.
            </Typography>
          </Box>
          <Divider sx={{ mt: 4 }} />
          <Box>
            <Link href="../preview" variant="body2">
              Start a new application
            </Link>
          </Box>
        </FormInner>
      </Container>
    </>
  );
};

export default InviteToPay;
