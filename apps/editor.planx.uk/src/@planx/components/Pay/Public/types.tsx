export enum Action {
  NoFeeFound,
  /** Landed on Pay, has not redirected to Gov Pay to initiate payment */
  NoPaymentFound,
  IncompletePaymentFound,
  IncompletePaymentConfirmed,
  /** We could not read the payment status, so we don't know whether the user has paid */
  PaymentStatusUnknown,
  StartNewPayment,
  StartNewPaymentError,
  ResumePayment,
  Success,
  ZeroFee,
}
