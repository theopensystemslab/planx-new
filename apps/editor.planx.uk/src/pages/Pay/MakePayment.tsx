import Check from "@mui/icons-material/Check";
import Container from "@mui/material/Container";
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { formatRawProjectTypes } from "@opensystemslab/planx-core";
import { FeeBreakdown } from "@planx/components/Pay/Public/FeeBreakdown/FeeBreakdown";
import { format } from "date-fns";
import { usePaymentProvider } from "hooks/usePaymentProvider";
import { objectWithoutNullishValues } from "lib/objectHelpers";
import { getExpiryDateForPaymentRequest } from "lib/pay";
import { useStore } from "pages/FlowEditor/lib/store";
import Banner from "ui/public/Banner";
import { DescriptionList } from "ui/public/DescriptionList";
import type { PublicPaymentRequest } from "utils/routeUtils/payQueries";
import { z } from "zod";

import {
  formattedPriceWithCurrencySymbol,
  toDecimal,
} from "../../@planx/components/Pay/model";
import Confirm from "../../@planx/components/Pay/Public/Confirm";
import DelayedLoadingIndicator from "../../components/DelayedLoadingIndicator/DelayedLoadingIndicator";
import type { PaymentRequestState } from "./providers/types";
import { useGovUkPayRequest } from "./providers/useGovUkPayRequest";
import { useStripePayRequest } from "./providers/useStripePayRequest";

type Props = PublicPaymentRequest & {
  stripeSessionId?: string;
  cancelled?: boolean;
};

export default function MakePayment(props: Props) {
  if (props.paidAt) {
    return <PaymentRequestPage {...props} payment={{ status: "paid" }} />;
  }

  // A payment request stays on GOV.UK Pay once a GOV.UK payment has been started
  if (props.govPayPaymentId) return <PayWithGovUkPay {...props} />;

  return <PayWithTeamProvider {...props} />;
}

function PayWithTeamProvider(props: Props) {
  const { paymentProvider, data, loading, error } = usePaymentProvider();

  // Don't fall back to GOV.UK Pay for a team which may be on Stripe
  // There's no useNoPaymentProvider() path for ITP
  if (error) throw error;

  if (loading && !data) return <DelayedLoadingIndicator text="Loading..." />;

  return paymentProvider === "stripe" ? (
    <PayWithStripe {...props} />
  ) : (
    <PayWithGovUkPay {...props} />
  );
}

function PayWithGovUkPay(props: Props) {
  const payment = useGovUkPayRequest({
    paymentRequestId: props.id,
    govPayPaymentId: props.govPayPaymentId,
  });

  return <PaymentRequestPage {...props} payment={payment} />;
}

function PayWithStripe(props: Props) {
  const payment = useStripePayRequest({
    paymentRequestId: props.id,
    stripeSessionId: props.stripeSessionId,
    cancelled: props.cancelled,
  });

  return <PaymentRequestPage {...props} payment={payment} />;
}

function PaymentRequestPage({
  sessionPreviewData,
  createdAt,
  govPayPaymentId,
  stripePaymentId,
  paymentAmount,
  paidAt,
  feeBreakdown,
  payment,
}: Props & { payment: PaymentRequestState }) {
  const { address, rawProjectTypes } =
    parseSessionPreviewData(sessionPreviewData);
  const flowName = useStore((state) => state.flowName);
  const theme = useTheme();

  const isPaid = payment.status === "paid";
  const paidDate = paidAt ? Date.parse(paidAt) : Date.now();

  const details = objectWithoutNullishValues({
    "Application type": flowName,
    Fee: feeBreakdown
      ? undefined
      : formattedPriceWithCurrencySymbol(toDecimal(paymentAmount)),
    "Property address": address,
    "Project type":
      formatRawProjectTypes(rawProjectTypes) || "Project type not submitted",
    "Valid until": isPaid
      ? undefined
      : getExpiryDateForPaymentRequest(createdAt),
    "Paid at": isPaid ? format(paidDate, "dd MMMM yyyy") : undefined,
    "Payment reference": isPaid
      ? govPayPaymentId || stripePaymentId
      : undefined,
  }) as Record<string, string>;

  const paymentDetails = Object.entries(details).map(([term, details]) => ({
    term,
    details,
  }));

  return payment.status === "loading" ? (
    <DelayedLoadingIndicator text={payment.text} />
  ) : (
    <>
      {isPaid ? (
        <Banner
          Icon={Check}
          iconTitle={"Success"}
          heading="Payment received"
          color={{
            background: theme.palette.success.light,
            text: theme.palette.text.primary,
          }}
        >
          <Typography variant="body2" sx={{ pt: 2, maxWidth: "formWrap" }}>
            Thanks for making your payment. We'll send you a confirmation email.
          </Typography>
        </Banner>
      ) : (
        <Container maxWidth="contentWrap">
          <Typography
            component="h1"
            variant="h1"
            sx={{ maxWidth: "formWrap", pt: 5 }}
            gutterBottom
          >
            Pay
          </Typography>
        </Container>
      )}
      <Container maxWidth="contentWrap" sx={{ pb: 0 }}>
        <DescriptionList data={paymentDetails} />
      </Container>
      {payment.status === "ready" && (
        <>
          <Container maxWidth="contentWrap" sx={{ mt: 6, pb: 0 }}>
            <FeeBreakdown inviteToPayFeeBreakdown={feeBreakdown} />
          </Container>
          <Confirm
            fee={toDecimal(paymentAmount)}
            onConfirm={payment.onPay}
            buttonTitle={payment.buttonTitle}
            warning={payment.warning}
            showInviteToPay={false}
            hideFeeBanner={true}
          />
        </>
      )}
    </>
  );
}

const parseSessionPreviewData = (sessionPreviewData: unknown) => {
  // Represents what we believe the API will return
  const schema = z.object({
    _address: z.object({
      title: z.string(),
    }),
    "proposal.projectType": z.string().array().min(1),
  });

  // Parse and validate this assumption
  try {
    const {
      _address: { title: address },
      "proposal.projectType": rawProjectTypes,
    } = schema.parse(sessionPreviewData);
    return { address, rawProjectTypes };
  } catch {
    throw Error("Invalid session preview data");
  }
};
