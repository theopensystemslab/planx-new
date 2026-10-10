import Check from "@mui/icons-material/Check";
import Container from "@mui/material/Container";
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { formatRawProjectTypes } from "@opensystemslab/planx-core";
import type { GovUKPayment } from "@opensystemslab/planx-core/types";
import { PaymentStatus } from "@opensystemslab/planx-core/types";
import { FeeBreakdown } from "@planx/components/Pay/Public/FeeBreakdown/FeeBreakdown";
import axios from "axios";
import { format } from "date-fns";
import { objectWithoutNullishValues } from "lib/objectHelpers";
import { getExpiryDateForPaymentRequest } from "lib/pay";
import { useStore } from "pages/FlowEditor/lib/store";
import { useEffect, useState } from "react";
import Banner from "ui/public/Banner";
import { DescriptionList } from "ui/public/DescriptionList";
import type { PublicPaymentRequest } from "utils/routeUtils/payQueries";
import { z } from "zod";

import {
  formattedPriceWithCurrencySymbol,
  toDecimal,
} from "../../@planx/components/Pay/model";
import Confirm from "../../@planx/components/Pay/Public/Confirm";
import { logger } from "../../airbrake";
import DelayedLoadingIndicator from "../../components/DelayedLoadingIndicator/DelayedLoadingIndicator";

const States = {
  Init: {
    loading: "Loading...",
  },
  Fetching: {
    loading: "Loading payment information",
  },
  Finished: {
    loading: "Payment Successful",
  },
  Ready: {
    button: "Pay now",
    loading: "Connecting to the payment page",
  },
  ReadyToRetry: {
    button: "Retry payment",
    loading: "Reconnecting to the payment page",
  },
  Reset: {
    button: "Retry payment",
    loading: "Connecting to the payment page",
  },
} as const;

enum PaymentState {
  Completed,
  Pending,
  Failed,
  NotStarted,
}

export default function MakePayment({
  sessionPreviewData,
  createdAt,
  id: paymentRequestId,
  govPayPaymentId,
  stripePaymentId,
  paymentAmount,
  paidAt,
  feeBreakdown,
}: PublicPaymentRequest) {
  const { address, rawProjectTypes } =
    parseSessionPreviewData(sessionPreviewData);
  const [currentState, setState] = useState<
    (typeof States)[keyof typeof States]
  >(States.Init);
  const [isLoading, setIsLoading] = useState(true);
  const [payment, setPayment] = useState<GovUKPayment | undefined>(undefined);
  const flowName = useStore((state) => state.flowName);
  const theme = useTheme();

  // Pass async errors up to ErrorBoundary
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  useEffect(() => {
    if (errorMessage) throw Error(errorMessage);
  }, [errorMessage]);

  useEffect(() => {
    // If payment is completed, we don't need to fetch data from GovPay
    if (paidAt) {
      setState(States.Finished);
      setIsLoading(false);
      return;
    }
    // synchronize payment state on load
    updatePaymentState();
  }, []);

  const updatePaymentState = async () => {
    setState(States.Fetching);
    let responseData: GovUKPayment | null = null;

    try {
      responseData = await fetchPayment({
        paymentRequestId,
        govPayPaymentId,
      });
    } catch {
      setErrorMessage("Failed to fetch payment details");
    }

    if (responseData) resolvePaymentResponse(responseData);
    setIsLoading(false);
    switch (computePaymentState(responseData)) {
      case PaymentState.NotStarted:
        setState(States.Ready);
        break;
      case PaymentState.Pending:
        setState(States.ReadyToRetry);
        break;
      case PaymentState.Failed:
        setState(States.Reset);
        setPayment(undefined);
        break;
      case PaymentState.Completed:
        setState(States.Finished);
        break;
    }
  };

  const resolvePaymentResponse = (responseData: GovUKPayment): GovUKPayment => {
    if (!responseData?.state?.status)
      throw new Error("Corrupted response from GOV.UK");
    setPayment(responseData);
    // useState is async, so we also pass the resolved value to the chained promise
    return responseData;
  };

  const readyAction = async () => {
    setIsLoading(true);
    if (payment && currentState === States.ReadyToRetry) {
      redirectToGovPay(payment);
    } else {
      await startNewPayment(paymentRequestId)
        .then(resolvePaymentResponse)
        .then(redirectToGovPay)
        .catch(logger.notify);
    }
  };

  const isPaid = currentState === States.Finished;
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

  return isLoading ? (
    <DelayedLoadingIndicator text={currentState.loading} />
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
      {(currentState === States.Ready ||
        currentState === States.Reset ||
        currentState === States.ReadyToRetry) &&
        !isLoading && (
          <>
            <Container maxWidth="contentWrap" sx={{ mt: 6, pb: 0 }}>
              <FeeBreakdown inviteToPayFeeBreakdown={feeBreakdown} />
            </Container>
            <Confirm
              fee={toDecimal(paymentAmount)}
              onConfirm={readyAction}
              buttonTitle={currentState.button!}
              showInviteToPay={false}
              hideFeeBanner={true}
              paymentStatus={payment?.state.status}
            />
          </>
        )}
    </>
  );
}

// refetch payment from GovPay (via proxy) to confirm it's status
async function fetchPayment({
  paymentRequestId,
  govPayPaymentId,
}: {
  paymentRequestId: string;
  govPayPaymentId: string | null;
}): Promise<GovUKPayment | null> {
  if (!govPayPaymentId) return Promise.resolve(null);
  const paymentURL = `${
    import.meta.env.VITE_APP_API_URL
  }/payment-request/${paymentRequestId}/payment/${govPayPaymentId}`;
  const response = await axios.get<GovUKPayment>(paymentURL);
  return response.data;
}

// initiate a new payment with GovPay (via proxy)
async function startNewPayment(
  paymentRequestId: string,
): Promise<GovUKPayment> {
  const paymentURL = `${
    import.meta.env.VITE_APP_API_URL
  }/payment-request/${paymentRequestId}/pay?returnURL=${encodeURIComponent(
    window.location.href,
  )}`;
  const response = await axios.post<GovUKPayment>(paymentURL);
  return response.data;
}

// return to GovPay with an existing payment
function redirectToGovPay(payment?: GovUKPayment) {
  if (payment && payment._links.next_url?.href) {
    window.location.replace(payment._links.next_url.href);
  } else {
    logger.notify(
      "GovPay redirect failed. The payment didn't exist or did not include a 'next_url' link.",
    );
  }
}

function computePaymentState(govUkPayment: GovUKPayment | null): PaymentState {
  if (!govUkPayment) {
    return PaymentState.NotStarted;
  }
  if (govUkPayment.state.status === PaymentStatus.success) {
    return PaymentState.Completed;
  }
  const paymentHasNextLinks = !!govUkPayment._links?.next_url?.href;
  if (
    [
      PaymentStatus.started,
      PaymentStatus.created,
      PaymentStatus.submitted,
    ].includes(govUkPayment.state.status) &&
    paymentHasNextLinks
  ) {
    return PaymentState.Pending;
  }
  return PaymentState.Failed;
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
