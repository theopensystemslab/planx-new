export interface StripeConnectStatus {
  connected: boolean;
  accountId: string | null;
  mode: "test" | "live";
}
