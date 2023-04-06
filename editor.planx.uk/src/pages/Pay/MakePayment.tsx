import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import React from "react";

import { toDecimal } from "../../@planx/components/Pay/model";
import Confirm from "../../@planx/components/Pay/Public/Confirm";
import { logger } from "../../airbrake";
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

const MakePayment: React.FC<PaymentRequest> = ({
  sessionPreviewData,
  createdAt,
  paymentRequestId,
  paymentAmount,
}) => {
  const [state, setState] = useState(States.Init);
  const [loading, isLoading] = useState(true);
  const [payment, setPayment] = useState(
    sessionPreviewData.govUkPayment || undefined
  );

  const updatePaymentState = async () => {
    setState(States.Fetching);
    fetchPayment().then((responseData: GovUKPayment) => {
      resolvePaymentResponse(responseData);
      isLoading(false);
      switch (computePaymentState(payment)) {
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

  // set-up initial payment state
  updatePaymentState();

  const readyAction = async () => {
    isLoading(true);
    if (state === States.Ready) {
      await startNewPayment()
        .then(resolvePaymentResponse)
        .then(() => redirectToGovPay(payment));
    } else if (state === States.ReadyToRetry) {
      redirectToGovPay(payment);
    }
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

  const handleSuccess = async () => {
    // TODO
    // save payment details in lowcal session and update payment request
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
        {!loading &&
        (state === States.Ready || state === States.ReadyToRetry) ? (
          <Confirm
            fee={paymentAmount}
            onConfirm={() => readyAction()}
            buttonTitle={state.button}
            showInviteToPay={false}
            paymentStatus={govUkPayment?.state?.status}
          />
        ) : (
          <DelayedLoadingIndicator text={state.loading} />
        )}
      </Typography>
    </Box>
  );
};

// refetch payment from GovPay to confirm it's status
async function fetchPayment(payload) {
  // TODO
  //return await axios.get<Pick<GovUKPayment, "state">>();
  return Promise.reject();
}

// initiate a new payment with GovPay
async function startNewPayment(payload): Promise<GovUKPayment> {
  // TPDP
  //await axios
  //  .post("", {})
  //  .then(async (res: GovUKPayment) => {
  //    return res.data;
  //  });
  return Promise.reject();
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

function computePaymentState(govUkPayment: GovUKPayment): PaymentState {
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

export default MakePayment;
