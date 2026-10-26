import { formatStripeMetadata } from "@opensystemslab/planx-core";
import type { Passport as IPassport } from "@opensystemslab/planx-core/types";
import { useQuery } from "@tanstack/react-query";
import { useMatches, useSearch } from "@tanstack/react-router";
import type { APIError } from "lib/api/client";
import {
  createStripeCheckoutSession,
  getStripeCheckoutSessionStatus,
} from "lib/api/stripe/requests";
import { useStore } from "pages/FlowEditor/lib/store";
import { useEffect } from "react";
import { useErrorBoundary } from "react-error-boundary";
import type { FileRouteTypes } from "routeTree.gen";
import { z } from "zod";

import { makeData } from "../../../shared/utils";
import { getDefaultContent } from "../../model";
import type { Props } from "../Pay";
import type { StripeAction } from "../types";
import { Action } from "../types";
import { getStripeCheckoutURL, isNoPaymentMethodError } from "./stripeCheckout";
import { STRIPE_PASSPORT_KEY, type UsePaymentProviderResult } from "./types";

// Payments are only taken on published services - never on /draft or /preview test links
const TEST_ENVIRONMENT_ROUTE_IDS = new Set<string>([
  "/_public/_planXDomain/$team/$flow/draft",
  "/_public/_planXDomain/$team/$flow/preview",
] satisfies FileRouteTypes["id"][]);

type StripeAPIError = APIError<{ error: string }>;

const stripeAPIErrorSchema = z.object({
  message: z.string(),
  statusCode: z.number(),
  data: z.object({ error: z.string() }),
}) satisfies z.ZodType<StripeAPIError>;

/**
 * Refusals which mean this team cannot take Stripe payments yet
 */
const STRIPE_NOT_CONFIGURED_ERRORS = [
  /^Stripe payments are not (yet )?enabled/,
  /has not connected a Stripe account/,
  /is not connected or cannot take payments/,
];

const isStripeNotConfiguredError = ({ statusCode, data }: StripeAPIError) =>
  statusCode === 409 &&
  STRIPE_NOT_CONFIGURED_ERRORS.some((pattern) => pattern.test(data.error));

export function useStripePay(
  props: Props,
  dispatch: React.Dispatch<StripeAction>,
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

  const isTestEnvironment = useMatches().some(({ routeId }) =>
    TEST_ENVIRONMENT_ROUTE_IDS.has(routeId),
  );

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
      environment === "standalone" &&
      !isTestEnvironment &&
      Boolean(stripeSessionId) &&
      !wasCancelled,
    refetchInterval: (query) =>
      query.state.data?.paymentStatus === "paid" ? false : 3000,
  });

  const handleSuccess = () => {
    dispatch(Action.Success);
    // TODO: Store full payload
    props.handleSubmit &&
      props.handleSubmit(
        makeData(props, checkoutStatus?.paymentIntentId, STRIPE_PASSPORT_KEY),
      );
  };

  const startNewPayment = async () => {
    dispatch(Action.StartNewPayment);

    // Skip the redirect when viewing in the Editor or using Pay in info-only mode
    if (environment !== "standalone" || props.hidePay) {
      handleSuccess();
      return;
    }

    // Show the "skip payment and continue testing" error on test links
    if (isTestEnvironment) {
      dispatch(Action.StartNewPaymentError);
      return;
    }

    try {
      const { url } = await createStripeCheckoutSession({
        teamSlug,
        sessionId,
        flowId,
        metadata,
      });

      // Redirect the browser to hosted Stripe Checkout
      window.location.assign(getStripeCheckoutURL(url));
    } catch (error) {
      const apiError = stripeAPIErrorSchema.safeParse(error);
      if (!apiError.success) {
        showBoundary(error);
        return;
      }

      if (isStripeNotConfiguredError(apiError.data)) {
        dispatch(Action.StartNewPaymentError);
        return;
      }

      if (isNoPaymentMethodError(apiError.data)) {
        dispatch(Action.NoPaymentMethod);
        return;
      }

      showBoundary(Error(apiError.data.data.error));
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
    passportKey: STRIPE_PASSPORT_KEY,
    hasExistingPayment: hasReturnedFromCheckout,
  };
}
