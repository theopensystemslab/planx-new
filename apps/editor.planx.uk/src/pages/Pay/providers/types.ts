export type PaymentRequestState =
  | { status: "loading"; text: string }
  | {
      status: "ready";
      buttonTitle: string;
      onPay: () => void;
      warning?: string;
    }
  | { status: "paid"; reference: string | null };
