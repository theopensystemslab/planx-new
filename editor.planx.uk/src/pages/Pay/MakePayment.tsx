import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { PaymentRequest } from "@opensystemslab/planx-core";
import axios from "axios";
import { getExpiryDateForPaymentRequest } from "lib/pay";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useEffect, useState } from "react";
import { DescriptionList } from "ui/DescriptionList";

import {
  formattedPriceWithCurrencySymbol,
  toDecimal,
} from "../../@planx/components/Pay/model";
import Confirm from "../../@planx/components/Pay/Public/Confirm";
import { logger } from "../../airbrake";
import DelayedLoadingIndicator from "../../components/DelayedLoadingIndicator";
import { GovUKPayment, PaymentStatus } from "../../types";

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
    button: "Pay using GOV.UK Pay",
    loading: "Connecting to GOV.UK Pay",
  },
  ReadyToRetry: {
    button: "Retry payment",
    loading: "Reconnecting to GOV.UK Pay",
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
  paymentAmount,
}: PaymentRequest) {
  // TODO: Type/parse this?
  const {
    _address: { title: addressTitle },
    "proposal.projectType": rawProjectTypes,
    govUkPayment,
  } = sessionPreviewData as any;

  const expiryDate = getExpiryDateForPaymentRequest(createdAt);
  const [currentState, setState] = useState<typeof States[keyof typeof States]>(
    States.Init
  );
  const [loading, isLoading] = useState(true);
  const [payment, setPayment] = useState<GovUKPayment | undefined>(
    govUkPayment || undefined
  );
  const flowName = useStore((state) => state.flowName);

  useEffect(() => {
    const updatePaymentState = async () => {
      setState(States.Fetching);
      const responseData = await fetchPayment({
        paymentRequestId,
        govPayPaymentId,
      });
      if (responseData) resolvePaymentResponse(responseData);
      isLoading(false);
      switch (computePaymentState(responseData)) {
        case PaymentState.NotStarted:
          setState(States.Ready);
          break;
        case PaymentState.Pending:
          setState(States.ReadyToRetry);
          break;
        case PaymentState.Failed:
          setState(States.ReadyToRetry);
          setPayment(undefined);
          break;
        case PaymentState.Completed:
          console.log("completed....!!");
          setState(States.Finished);
          handleSuccess();
          break;
      }
    };
    // synchronize payment state on load
    updatePaymentState();
  }, []);

  const handleSuccess = () => {
    // TODO - route to confirmation page
    alert("payment succeeded");
  };

  const resolvePaymentResponse = (responseData: GovUKPayment): GovUKPayment => {
    if (!responseData?.state?.status)
      throw new Error("Corrupted response from GOV.UK");
    const resolvedPayment: GovUKPayment = {
      ...responseData,
      amount: toDecimal(responseData.amount),
    };
    setPayment(resolvedPayment);
    // useState is async, so we also pass the resolved value to the chained promise
    return resolvedPayment;
  };

  const readyAction = async () => {
    isLoading(true);
    if (payment && currentState === States.ReadyToRetry) {
      redirectToGovPay(payment);
    } else {
      await startNewPayment(paymentRequestId)
        .then(resolvePaymentResponse)
        .then(redirectToGovPay)
        .catch(logger.notify);
    }
  };

  return (
    <Box pt={5}>
      <Typography variant="h1" gutterBottom>
        Pay for your application
      </Typography>
      <DescriptionList
        data={[
          { term: "Application type", details: flowName },
          {
            term: "Fee",
            details: formattedPriceWithCurrencySymbol(toDecimal(paymentAmount)),
          },
          {
            term: "Address",
            details: addressTitle,
          },
          {
            term: "Project type",
            details: rawProjectTypes.join(", "),
          },
          {
            term: "Valid until",
            details: expiryDate,
          },
        ]}
      />
      <Typography variant="body1">
        {(currentState === States.Ready ||
          currentState === States.ReadyToRetry) &&
        !loading ? (
          <Confirm
            fee={toDecimal(paymentAmount)}
            onConfirm={readyAction}
            buttonTitle={currentState.button!}
            showInviteToPay={false}
            hideFeeBanner={true}
            paymentStatus={govUkPayment?.state.status}
          />
        ) : (
          <DelayedLoadingIndicator text={currentState.loading} />
        )}
      </Typography>
    </Box>
  );
}

// refetch payment from GovPay (via proxy) to confirm it's status
async function fetchPayment({
  paymentRequestId,
  govPayPaymentId,
}: {
  paymentRequestId: string;
  govPayPaymentId?: string;
}): Promise<GovUKPayment | null> {
  if (!govPayPaymentId) return Promise.resolve(null);
  const paymentURL = `${process.env.REACT_APP_API_URL}/payment-request/${paymentRequestId}/payment/${govPayPaymentId}`;
  const response = await axios.get<GovUKPayment>(paymentURL);
  return response.data;
}

// initiate a new payment with GovPay (via proxy)
async function startNewPayment(
  paymentRequestId: string
): Promise<GovUKPayment> {
  const paymentURL = `${process.env.REACT_APP_API_URL}/payment-request/${paymentRequestId}/pay?returnURL=${window.location.href}`;
  const response = await axios.post<GovUKPayment>(paymentURL);
  return response.data;
}

// return to GovPay with an existing payment
function redirectToGovPay(payment?: GovUKPayment) {
  if (payment && payment._links.next_url?.href) {
    window.location.replace(payment._links.next_url.href);
  } else {
    logger.notify(
      "GovPay redirect failed. The payment didn't exist or did not include a 'next_url' link."
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
  if (
    [
      PaymentStatus.started,
      PaymentStatus.created,
      PaymentStatus.submitted,
    ].includes(govUkPayment.state.status)
  ) {
    return PaymentState.Pending;
  }
  // PaymentStatus.cancelled, PaymentStatus.error, PaymentStatus.failed,
  return PaymentState.Failed;
}
