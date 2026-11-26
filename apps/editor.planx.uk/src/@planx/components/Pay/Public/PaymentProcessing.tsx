import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Link from "@mui/material/Link";
import { styled, useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { contentFlowSpacing } from "@planx/components/shared/Preview/Card";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import Banner from "ui/public/Banner";
import ViewApplicationLink from "ui/public/ViewApplicationLink";

const List = styled("ul")(({ theme }) => ({
  fontSize: theme.typography.body2.fontSize,
}));

const FormInner = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2, 0, 4),
  "& > *": {
    ...contentFlowSpacing(theme),
  },
}));

/**
 * Shown when the applicant returns from Stripe Checkout having paid by a delayed payment method (e.g. Bacs Direct Debit)
 *
 * The application isn't submitted yet - the API submits it once the payment succeeds, and the session is locked until then
 *
 * Also shown when resuming the locked session (including the redirect back from Checkout for save & return services),
 * where the session's answers aren't loaded so there's no application to view
 */
const PaymentProcessing: React.FC<{ showViewApplicationLink?: boolean }> = ({
  showViewApplicationLink = true,
}) => {
  const theme = useTheme();
  const [teamName, { helpEmail, helpOpeningHours, helpPhone }] = useStore(
    (state) => [state.teamName, state.teamSettings],
  );

  return (
    <Box sx={{ textAlign: "left", width: "100%" }}>
      <Banner
        heading="Payment processing"
        color={{
          background: theme.palette.info.light,
          text: theme.palette.text.primary,
        }}
      >
        <Typography variant="body2" sx={{ pt: 2, maxWidth: "formWrap" }}>
          Your application will be sent to {teamName} once your payment has been
          taken.
        </Typography>
      </Banner>
      <Container maxWidth="contentWrap">
        <FormInner sx={{ maxWidth: "formWrap" }}>
          <Typography variant="h2" sx={{ mt: 2 }}>
            What happens next
          </Typography>
          <List>
            <li>your payment can take up to 7 working days to be taken</li>
            <li>
              you will receive an email when your payment has been taken, or if
              it fails
            </li>
            <li>
              your application will be sent automatically once your payment has
              been taken - you don't need to do anything else
            </li>
            <li>
              if your payment fails, the email will include a link to pay again
            </li>
          </List>
          <Typography variant="body2">
            You can't make changes to your application while your payment is
            being processed.
          </Typography>
          <Divider sx={{ mt: 4 }} />
          <Typography variant="h2" sx={{ mt: 4 }}>
            Contact us
          </Typography>
          <Typography variant="body2">
            Contact us if you have any questions about your application or
            payment.
          </Typography>
          <Box>
            <Typography variant="body2">
              <strong>Telephone</strong> {helpPhone}
            </Typography>
            <Typography variant="body2">{helpOpeningHours}</Typography>
          </Box>
          <Typography variant="body2">
            <strong>Email</strong>{" "}
            <Link href={`mailto:${helpEmail}`}>{helpEmail}</Link>
          </Typography>
          {showViewApplicationLink && (
            <>
              <Divider sx={{ my: 4 }} />
              <ViewApplicationLink />
            </>
          )}
        </FormInner>
      </Container>
    </Box>
  );
};

export default PaymentProcessing;
