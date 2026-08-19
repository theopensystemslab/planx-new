import type {
  GovPayMetadata,
  GovUKPayment,
} from "@opensystemslab/planx-core/types";
import {
  GOV_PAY_PASSPORT_KEY,
  PaymentStatus,
} from "@opensystemslab/planx-core/types";
import { logger } from "airbrake";
import type { APIError } from "lib/api/client";
import { getPayment, initiatePayment } from "lib/api/pay/requests";
import { saveSession } from "lib/local.new";
import { useStore } from "pages/FlowEditor/lib/store";
import { useErrorBoundary } from "react-error-boundary";

import { makeData } from "../../../shared/utils";
import { createPayload } from "../../model";
import type { Props } from "../Pay";
import { PAY_API_ERROR_UNSUPPORTED_TEAM } from "../Pay";
import { Action } from "../types";
import type { UsePaymentProviderResult } from "./types";

const redirectToGovPay = (payment: GovUKPayment) => {
  const nextUrl = payment._links.next_url?.href;
  if (!nextUrl) {
    logger.notify("Payment did not include a 'next_url' link.");
    return;
  }
  // assign() is used to preserve history
  // This allows browser "back" navigation to work from GOV.UK Pay,
  // meaning that users can resume sessions by confirming their email
  window.location.assign(nextUrl);
};

export function useGovUkPay(
  props: Props,
  dispatch: React.Dispatch<Action>,
  fee: number,
  metadata: GovPayMetadata[],
): UsePaymentProviderResult {
  const [
    flowId,
    sessionId,
    breadcrumbs,
    govUkPayment,
    setGovUkPayment,
    passport,
    environment,
    teamSlug,
  ] = useStore((state) => [
    state.id,
    state.sessionId,
    state.breadcrumbs,
    state.govUkPayment,
    state.setGovUkPayment,
    state.computePassport(),
    state.previewEnvironment,
    state.teamSlug,
  ]);

  const { showBoundary } = useErrorBoundary();

  const normalizePaymentResponse = (
    responseData: GovUKPayment,
  ): GovUKPayment => {
    if (!responseData?.state?.status)
      throw new Error("Corrupted response from GOV.UK");
    return responseData;
  };

  const resolvePaymentResponse = async (
    responseData: GovUKPayment,
  ): Promise<GovUKPayment> => {
    const payment = normalizePaymentResponse(responseData);
    setGovUkPayment(payment);
    // save a record of the session with the latest payment for debugging purposes
    await saveSession({
      breadcrumbs,
      id: flowId,
      passport,
      sessionId,
      govUkPayment: payment,
    });
    return payment;
  };

  const handleSuccess = () => {
    dispatch(Action.Success);
    props.handleSubmit &&
      props.handleSubmit(makeData(props, govUkPayment, GOV_PAY_PASSPORT_KEY));
  };

  const refetchPayment = async () => {
    dispatch(Action.IncompletePaymentFound);

    const paymentId = govUkPayment?.payment_id;

    if (!govUkPayment || !paymentId) {
      logger.notify(`Missing GOV.UK payment_id for session ${sessionId}`);
      dispatch(Action.PaymentStatusUnknown);
      return;
    }

    try {
      const { state } = await getPayment({
        teamSlug,
        sessionId,
        flowId,
        paymentId,
      });

      // Update local state with the refetched payment state
      await resolvePaymentResponse({
        ...govUkPayment,
        state,
      });

      if (state.status === PaymentStatus.success) {
        handleSuccess();
        return;
      }

      dispatch(Action.IncompletePaymentConfirmed);
    } catch (err) {
      // XXX: There's probably been an issue fetching the payment status,
      //      allow user to re-run status check instead of silently failing
      logger.notify(err);
      dispatch(Action.PaymentStatusUnknown);
    }
  };

  const startNewPayment = async () => {
    dispatch(Action.StartNewPayment);

    // Skip the redirect process if viewing this within the Editor or using Pay in info-only mode
    if (environment !== "standalone" || props.hidePay) {
      handleSuccess();
      return;
    }

    const payload = createPayload(fee, sessionId, metadata, passport);
    await initiatePayment({
      teamSlug,
      flowId,
      sessionId,
      payload,
    })
      .then(async (data) => {
        const payment = await resolvePaymentResponse(data);
        redirectToGovPay(payment);
      })
      .catch((error: APIError<{ error: string }>) => {
        const apiErrorMessage = error.data.error;

        if (apiErrorMessage.startsWith(PAY_API_ERROR_UNSUPPORTED_TEAM)) {
          // Show a custom message if this team isn't set up to use Pay yet
          dispatch(Action.StartNewPaymentError);
        } else {
          // Throw all other errors so they're caught by our ErrorBoundary
          showBoundary(Error(apiErrorMessage));
        }
      });
  };

  const resumeExistingPayment = async () => {
    dispatch(Action.ResumePayment);

    if (!govUkPayment) {
      await startNewPayment();
      return;
    }

    switch (govUkPayment.state.status) {
      case PaymentStatus.cancelled:
      case PaymentStatus.error:
      case PaymentStatus.failed: {
        await startNewPayment();
        break;
      }
      case PaymentStatus.started:
      case PaymentStatus.created:
      case PaymentStatus.submitted: {
        redirectToGovPay(govUkPayment);
        break;
      }
      default: {
        logger.notify("Unhandled payment status");
      }
    }
  };

  return {
    actions: {
      startNewPayment,
      refetchPayment,
      resumeExistingPayment,
      handleSuccess,
    },
    passportKey: GOV_PAY_PASSPORT_KEY,
    hasExistingPayment: Boolean(govUkPayment),
  };
}
