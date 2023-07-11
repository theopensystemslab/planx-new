import Check from "@mui/icons-material/Check";
import Container from "@mui/material/Container";
import { lighten, useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import {
  type PaymentRequest,
  GovUKPayment,
  PaymentStatus,
} from "@opensystemslab/planx-core/types";
import axios from "axios";
import { _public } from "client";
import { format } from "date-fns";
import { getExpiryDateForPaymentRequest } from "lib/pay";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useEffect, useState } from "react";
import Banner from "ui/Banner";
import { DescriptionList } from "ui/DescriptionList";
import { z } from "zod";

import {
  formattedPriceWithCurrencySymbol,
  toDecimal,
} from "../../@planx/components/Pay/model";
import Confirm from "../../@planx/components/Pay/Public/Confirm";
import { logger } from "../../airbrake";
import DelayedLoadingIndicator from "../../components/DelayedLoadingIndicator";

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
  Reset: {
    button: "Retry payment",
    loading: "Connecting to GOV.UK Pay",
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
  paidAt,
}: PaymentRequest) {
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
    } catch (error) {
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
    const resolvedPayment: GovUKPayment = {
      ...responseData,
      amount: toDecimal(responseData.amount),
    };
    setPayment(resolvedPayment);
    // useState is async, so we also pass the resolved value to the chained promise
    return resolvedPayment;
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

  const Header = () =>
    currentState === States.Finished ? (
      <Banner
        Icon={Check}
        iconTitle={"Success"}
        heading="Payment received"
        color={{
          background: lighten(theme.palette.success.main, 0.9),
          text: "black",
        }}
      >
        <Typography pt={2} variant="body2" maxWidth="formWrap">
          Thanks for making your payment. We'll send you a confirmation email.
        </Typography>
      </Banner>
    ) : (
      <Container maxWidth="contentWrap">
        <Typography maxWidth="formWrap" variant="h1" pt={5} gutterBottom>
          Pay for your application
        </Typography>
      </Container>
    );

  const PaymentDetails = () => {
    const [projectType, setProjectType] = useState<string | undefined>();

    useEffect(() => {
      const fetchProjectType = async () => {
        const projectType = await _public.formatRawProjectTypes(
          rawProjectTypes
        );
        setProjectType(projectType);
      };
      fetchProjectType();
    }, []);

    const data = [
      { term: "Application type", details: flowName },
      {
        term: "Fee",
        details: formattedPriceWithCurrencySymbol(toDecimal(paymentAmount)),
      },
      {
        term: "Property address",
        details: address,
      },
      {
        term: "Project type",
        details: projectType || "Project type not submitted",
      },
    ];

    // Handle payments completed before page load
    if (paidAt) {
      data.push({
        term: "Paid at",
        details: format(Date.parse(paidAt), "dd MMMM yyyy"),
      });
      // Handle payments just completed (on immediate return from GovPay)
    } else if (currentState === States.Finished) {
      data.push({
        term: "Paid at",
        details: format(Date.now(), "dd MMMM yyyy"),
      });
      // Handle payments not started
    } else {
      data.push({
        term: "Valid until",
        details: getExpiryDateForPaymentRequest(createdAt),
      });
    }

    return (
      <Container maxWidth="contentWrap" sx={{ pb: 0 }}>
        <DescriptionList data={data} />
      </Container>
    );
  };

  return isLoading ? (
    <DelayedLoadingIndicator text={currentState.loading} />
  ) : (
    <>
      <Header />
      <PaymentDetails />
      {(currentState === States.Ready ||
        currentState === States.Reset ||
        currentState === States.ReadyToRetry) &&
        !isLoading && (
          <Confirm
            fee={toDecimal(paymentAmount)}
            onConfirm={readyAction}
            buttonTitle={currentState.button!}
            showInviteToPay={false}
            hideFeeBanner={true}
            paymentStatus={payment?.state.status}
          />
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
  const paymentURL = `${
    process.env.REACT_APP_API_URL
  }/payment-request/${paymentRequestId}/pay?returnURL=${encodeURIComponent(
    window.location.href
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
  // PaymentStatus.cancelled, PaymentStatus.error, PaymentStatus.failed,
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
  } catch (error) {
    throw Error("Invalid session preview data");
  }
};
