export enum Action {
  NoFeeFound,
  /** Landed on Pay, has not redirected to Gov Pay to initiate payment */
  NoPaymentFound,
  ZeroFee,
  StartNewPayment,
  Success,
  IncompletePaymentFound,
  IncompletePaymentConfirmed,
  /** We could not read the payment status, so we don't know whether the user has paid */
  PaymentStatusUnknown,
  StartNewPaymentError,
  ResumePayment,
  /** Confirming the payment against Stripe after returning from Checkout */
  PaymentPending,
  /** Applicant cancelled, or the Checkout Session expired */
  PaymentCancelled,
}

export type SharedAction =
  | Action.NoFeeFound
  | Action.NoPaymentFound
  | Action.ZeroFee
  | Action.StartNewPayment
  | Action.StartNewPaymentError
  | Action.Success;

export type GovPayAction =
  | SharedAction
  | Action.IncompletePaymentFound
  | Action.IncompletePaymentConfirmed
  | Action.PaymentStatusUnknown
  | Action.ResumePayment;

export type StripeAction =
  SharedAction | Action.PaymentPending | Action.PaymentCancelled;

export type NoPaymentAction = SharedAction;
