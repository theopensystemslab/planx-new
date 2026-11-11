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
import ErrorSummary from "ui/shared/ErrorSummary/ErrorSummary";
import type { PublicPaymentRequest } from "utils/routeUtils/payQueries";
import { z } from "zod";

import {
  formattedPriceWithCurrencySymbol,
  toDecimal,
} from "../../@planx/components/Pay/model";
import Confirm from "../../@planx/components/Pay/Public/Confirm";
import {
  PAY_ERROR_NO_PAYMENT_METHOD,
  PAY_ERROR_NO_PAYMENT_METHOD_MESSAGE,
} from "../../@planx/components/Pay/Public/Pay";
import DelayedLoadingIndicator from "../../components/DelayedLoadingIndicator/DelayedLoadingIndicator";
import type { PaymentRequestState } from "./providers/types";
import { useGovUkPayRequest } from "./providers/useGovUkPayRequest";
import { useStripePayRequest } from "./providers/useStripePayRequest";

type Props = PublicPaymentRequest & {
  stripeSessionId?: string;
  cancelled?: boolean;
};

/**
 * The payment request only records that it was fulfilled (paid_at), not whether the payment is paid or pending
 */
const getPaymentFromRequest = (props: Props): PaymentRequestState => ({
  status: "paid",
  reference: props.govPayPaymentId ?? props.stripePaymentId,
});

export default function MakePayment(props: Props) {
  const isFulfilled = Boolean(props.paidAt);
  const hasReturnedFromStripeCheckout = Boolean(props.stripeSessionId);

  if (isFulfilled && hasReturnedFromStripeCheckout) {
    return <CheckStripePaymentStatus {...props} />;
  }

  if (isFulfilled) {
    return (
      <PaymentRequestPage {...props} payment={getPaymentFromRequest(props)} />
    );
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

/**
 * Fulfilment is idempotent, so for a fulfilled request it only reads the payment status from Stripe
 */
function CheckStripePaymentStatus(props: Props) {
  const stripePayment = useStripePayRequest({
    paymentRequestId: props.id,
    stripeSessionId: props.stripeSessionId,
  });

  const isStripeStatusAvailable =
    stripePayment.status === "loading" ||
    stripePayment.status === "paid" ||
    stripePayment.status === "pending";

  const payment = isStripeStatusAvailable
    ? stripePayment
    : getPaymentFromRequest(props);

  return <PaymentRequestPage {...props} payment={payment} />;
}

const FULFILLED_PAYMENT_CONTENT = {
  paid: {
    heading: "Payment received",
    text: "Thanks for making your payment. We'll send you a confirmation email.",
  },
  pending: {
    heading: "Payment processing",
    text: "Your payment is being processed. This can take several working days. We'll send you a confirmation email.",
  },
};

function PaymentRequestPage({
  sessionPreviewData,
  createdAt,
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
  const isFulfilled = payment.status === "paid" || payment.status === "pending";
  const paidDate = paidAt ? Date.parse(paidAt) : Date.now();

  const details = objectWithoutNullishValues({
    "Application type": flowName,
    Fee: feeBreakdown
      ? undefined
      : formattedPriceWithCurrencySymbol(toDecimal(paymentAmount)),
    "Property address": address,
    "Project type":
      formatRawProjectTypes(rawProjectTypes) || "Project type not submitted",
    "Valid until": isFulfilled
      ? undefined
      : getExpiryDateForPaymentRequest(createdAt),
    "Paid at": isPaid ? format(paidDate, "dd MMMM yyyy") : undefined,
    "Payment reference": isFulfilled ? payment.reference : undefined,
  }) as Record<string, string>;

  const paymentDetails = Object.entries(details).map(([term, details]) => ({
    term,
    details,
  }));

  return payment.status === "loading" ? (
    <DelayedLoadingIndicator text={payment.text} />
  ) : (
    <>
      {isFulfilled ? (
        <Banner
          Icon={Check}
          iconTitle={"Success"}
          heading={FULFILLED_PAYMENT_CONTENT[payment.status].heading}
          color={{
            background: theme.palette.success.light,
            text: theme.palette.text.primary,
          }}
        >
          <Typography variant="body2" sx={{ pt: 2, maxWidth: "formWrap" }}>
            {FULFILLED_PAYMENT_CONTENT[payment.status].text}
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
      {payment.status === "no_payment_method" && (
        <Container maxWidth="contentWrap" sx={{ mt: 6 }}>
          <ErrorSummary
            format="error"
            heading={PAY_ERROR_NO_PAYMENT_METHOD}
            message={PAY_ERROR_NO_PAYMENT_METHOD_MESSAGE}
          />
        </Container>
      )}
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
