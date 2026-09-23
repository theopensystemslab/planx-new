import { formatStripeMetadata } from "@opensystemslab/planx-core";
import type { Passport as IPassport } from "@opensystemslab/planx-core/types";
import { useQuery } from "@tanstack/react-query";
import { useSearch } from "@tanstack/react-router";
import {
  createStripeCheckoutSession,
  getStripeCheckoutSessionStatus,
} from "lib/api/stripe/requests";
import { useStore } from "pages/FlowEditor/lib/store";
import { useEffect } from "react";
import { useErrorBoundary } from "react-error-boundary";
import { ApplicationPath } from "types";

import { makeData } from "../../../shared/utils";
import { getDefaultContent, toPence } from "../../model";
import type { Props } from "../Pay";
import type { StripeAction } from "../types";
import { Action } from "../types";
import {
  PAYMENT_REFERENCE_PASSPORT_KEY,
  type UsePaymentProviderResult,
} from "./types";

const getStripeReturnURL = (): string => {
  const url = new URL(window.location.href);

  // Drop stripe return params from any previous attempt
  url.searchParams.delete("stripeSessionId");
  url.searchParams.delete("cancelled");

  // Ensure that applicant can bypass Resume page on return
  const { path, sessionId, saveToEmail } = useStore.getState();
  if (path === ApplicationPath.SaveAndReturn) {
    url.searchParams.set("sessionId", sessionId);
    url.searchParams.set("email", saveToEmail ?? "");
  }

  return url.toString();
};

export function useStripePay(
  props: Props,
  dispatch: React.Dispatch<StripeAction>,
  fee: number,
): UsePaymentProviderResult {
  const [flowId, sessionId, teamSlug, environment, passport] = useStore(
    (state) => [
      state.id,
      state.sessionId,
      state.teamSlug,
      state.previewEnvironment,
      state.computePassport(),
    ],
  );

  const metadata = formatStripeMetadata({
    metadata: [
      ...(props.govPayMetadata || []),
      ...getDefaultContent().govPayMetadata,
    ],
    userPassport: passport as IPassport,
    paidViaInviteToPay: false,
  });

  const { showBoundary } = useErrorBoundary();

  const search = useSearch({ strict: false });
  const stripeSessionId = search?.stripeSessionId;
  const wasCancelled = Boolean(search?.cancelled);
  const hasReturnedFromCheckout = Boolean(stripeSessionId || wasCancelled);

  // On return, confirm the payment against Stripe
  const { data: checkoutStatus } = useQuery({
    queryKey: ["stripeCheckoutSessionStatus", teamSlug, stripeSessionId],
    queryFn: () =>
      getStripeCheckoutSessionStatus({
        teamSlug,
        checkoutSessionId: stripeSessionId!,
      }),
    enabled:
      environment === "standalone" && Boolean(stripeSessionId) && !wasCancelled,
    refetchInterval: (query) =>
      query.state.data?.paymentStatus === "paid" ? false : 3000,
  });

  const handleSuccess = () => {
    dispatch(Action.Success);
    // TODO: Store full payload
    props.handleSubmit &&
      props.handleSubmit(
        makeData(
          props,
          checkoutStatus?.paymentIntentId,
          PAYMENT_REFERENCE_PASSPORT_KEY,
        ),
      );
  };

  const startNewPayment = async () => {
    dispatch(Action.StartNewPayment);

    // Skip the redirect when viewing in the Editor or using Pay in info-only mode
    if (environment !== "standalone" || props.hidePay) {
      handleSuccess();
      return;
    }

    try {
      const { url } = await createStripeCheckoutSession({
        teamSlug,
        sessionId,
        flowId,
        amount: toPence(fee),
        returnURL: getStripeReturnURL(),
        metadata,
      });

      if (!url) {
        throw new Error("Stripe Checkout Session did not include a URL");
      }

      // Redirect the browser to hosted Stripe Checkout
      window.location.assign(url);
    } catch (error) {
      showBoundary(error);
    }
  };

  /**
   * Called on mount when the applicant returns from hosted Checkout
   */
  const refetchPayment = async () => {
    if (wasCancelled) {
      dispatch(Action.PaymentCancelled);
      return;
    }

    if (stripeSessionId) {
      dispatch(Action.PaymentPending);
    }
  };

  // Resolve the pending state once Stripe reports the outcome
  useEffect(() => {
    if (!checkoutStatus) return;

    if (checkoutStatus.paymentStatus === "paid") {
      handleSuccess();
      return;
    }

    // A session that expired without payment — let the applicant try again
    // TODO: Account for "pending" status (e.g. Bacs) once fully migrated from GovPay
    if (checkoutStatus.status === "expired") {
      dispatch(Action.PaymentCancelled);
    }
  }, [checkoutStatus?.paymentStatus, checkoutStatus?.status]);

  const resumeExistingPayment = async () => {
    await startNewPayment();
  };

  return {
    actions: {
      startNewPayment,
      refetchPayment,
      resumeExistingPayment,
      handleSuccess,
    },
    passportKey: PAYMENT_REFERENCE_PASSPORT_KEY,
    hasExistingPayment: hasReturnedFromCheckout,
  };
}
