import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import axios from "axios";
import React, { useEffect, useState } from "react";

import {
  formattedPriceWithCurrencySymbol,
  toDecimal,
  toPence,
} from "../../@planx/components/Pay/model";
import Confirm from "../../@planx/components/Pay/Public/Confirm";
import { logger } from "../../airbrake";
import DelayedLoadingIndicator from "../../components/DelayedLoadingIndicator";
import { GovUKPayment, PaymentStatus } from "../../types";
import type { PaymentRequest } from "./types";

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
  paymentRequestId,
  paymentAmount,
}: PaymentRequest) {
  const [currentState, setState] = useState<typeof States[keyof typeof States]>(
    States.Init
  );
  const [loading, isLoading] = useState(true);
  const [payment, setPayment] = useState(
    sessionPreviewData.govUkPayment || undefined
  );

  useEffect(() => {
    const updatePaymentState = async () => {
      setState(States.Fetching);
      fetchPayment({
        paymentRequestId,
        payment: sessionPreviewData.govUkPayment,
      }).then((responseData: GovUKPayment | null) => {
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
            setState(States.Finished);
            handleSuccess();
            break;
        }
      });
    };
    // synchronize payment state on load
    updatePaymentState();
  }, []);

  const handleSuccess = () => {
    // TODO - route to confirmation page
  };

  const resolvePaymentResponse = (responseData: GovUKPayment) => {
    if (!responseData?.state?.status)
      throw new Error("Corrupted response from GOV.UK");
    let payment: GovUKPayment = {
      ...responseData,
      amount: toDecimal(responseData.amount),
    };
    setPayment(payment);
  };

  const readyAction = async () => {
    isLoading(true);
    if (payment && currentState === States.ReadyToRetry) {
      redirectToGovPay(payment);
    } else {
      await startNewPayment(paymentRequestId)
        .then(resolvePaymentResponse)
        .then(() => redirectToGovPay(payment))
        .catch(logger.notify);
    }
  };

  return (
    <Box>
      <Typography variant="h1" gutterBottom>
        Pay for your application
      </Typography>
      <table>
        <tr>
          <th>Application type</th>
          <td>{sessionPreviewData.serviceName}</td>
        </tr>
        <tr>
          <th>Fee</th>
          <td>{formattedPriceWithCurrencySymbol(paymentAmount)}</td>
        </tr>
        <tr>
          <th>Address</th>
          <td>{sessionPreviewData.singleLineAddress}</td>
        </tr>
        <tr>
          <th>Project type</th>
          <td>{sessionPreviewData.humanReadableProjectType}</td>
        </tr>
      </table>
      <Typography variant="body1">
        {(currentState === States.Ready ||
          currentState === States.ReadyToRetry) &&
        !loading ? (
          <Confirm
            fee={paymentAmount}
            onConfirm={readyAction}
            buttonTitle={currentState.button!}
            showInviteToPay={false}
            paymentStatus={sessionPreviewData.govUkPayment?.state?.status}
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
  payment,
}: {
  paymentRequestId: string;
  payment?: GovUKPayment;
}): Promise<GovUKPayment | null> {
  if (!payment) return Promise.resolve(null);
  const paymentURL = `${process.env.REACT_APP_API_URL}/payment-request/${paymentRequestId}/payment/${payment.payment_id}`;
  return await axios.get(paymentURL);
}

// initiate a new payment with GovPay (via proxy)
async function startNewPayment(
  paymentRequestId: string
): Promise<GovUKPayment> {
  const paymentURL = `${process.env.REACT_APP_API_URL}/payment-request/${paymentRequestId}/pay?returnURL=${window.location.href}`;
  return await axios.post(paymentURL);
}

// return to GovPay with an existing payment
function redirectToGovPay(payment?: GovUKPayment) {
  if (payment && payment._links.next_url?.href) {
    window.location.replace(payment._links.next_url.href);
  } else {
    logger.notify(
      "Retry payment failed. The payment didn't exist or did not include a 'next_url' link."
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
