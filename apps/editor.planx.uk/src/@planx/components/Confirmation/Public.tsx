import Check from "@mui/icons-material/Check";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { PAYMENT_PROCESSING_PASSPORT_KEY } from "@planx/components/Pay/Public/providers/types";
import Card from "@planx/components/shared/Preview/Card";
import type { PublicProps } from "@planx/components/shared/types";
import { useStore } from "pages/FlowEditor/lib/store";
import ApplicationSummary from "ui/public/ApplicationSummary";
import Banner from "ui/public/Banner";
import NumberedList from "ui/public/NumberedList";
import ViewApplicationLink from "ui/public/ViewApplicationLink";
import ReactMarkdownOrHtml from "ui/shared/ReactMarkdownOrHtml/ReactMarkdownOrHtml";

import type { Confirmation } from "./model";

export type Props = PublicProps<Confirmation>;

/**
 * Corrects the default "A payment receipt has been emailed to you" text without changing council content directly
 */
const PaymentProcessingNotice = () => (
  <Box sx={{ maxWidth: "formWrap" }}>
    <Typography variant="body1">
      Your Direct Debit is set up. Your bank takes the payment in up to 7
      working days. You get a receipt when the payment is complete.
    </Typography>
  </Box>
);

export default function ConfirmationComponent(props: Props) {
  const isFinalCard = useStore().isFinalCard();
  const isPaymentProcessing = useStore((state) =>
    Boolean(state.computePassport().data?.[PAYMENT_PROCESSING_PASSPORT_KEY]),
  );
  const theme = useTheme();
  const headingId = "confirmation-heading";
  return (
    <Box sx={{ width: "100%" }}>
      <Banner
        heading={props.heading || ""}
        headingId={headingId}
        color={{
          background: theme.palette.success.light,
          text: theme.palette.text.primary,
        }}
        Icon={Check}
        iconTitle={"Success"}
      >
        {props.description && (
          <Box sx={{ mt: 2, maxWidth: "formWrap" }}>
            <ReactMarkdownOrHtml source={props.description} openLinksOnNewTab />
          </Box>
        )}
        {isPaymentProcessing && <PaymentProcessingNotice />}
      </Banner>
      <Card handleSubmit={isFinalCard ? undefined : props.handleSubmit}>
        <ApplicationSummary titleId={headingId} />
        <ViewApplicationLink />
        {props.nextSteps && Boolean(props.nextSteps?.length) && (
          <Box sx={{ pt: 3 }}>
            <Typography variant="h2" sx={{ mb: 2 }}>
              What happens next?
            </Typography>
            <NumberedList items={props.nextSteps} heading="h2" />
          </Box>
        )}
        {props.moreInfo && (
          <>
            <Box sx={{ py: 1 }}>
              <ReactMarkdownOrHtml source={props.moreInfo} />
            </Box>
            <hr />
          </>
        )}
        {props.contactInfo && (
          <Box sx={{ py: 1 }}>
            <Typography variant="h2" component="h3" gutterBottom>
              Contact us
            </Typography>
            <ReactMarkdownOrHtml source={props.contactInfo} openLinksOnNewTab />
          </Box>
        )}
      </Card>
    </Box>
  );
}
