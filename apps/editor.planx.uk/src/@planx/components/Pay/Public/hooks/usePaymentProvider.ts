import { useStore } from "pages/FlowEditor/lib/store";

export const usePaymentProvider = () =>
  useStore((state) => state.teamSettings?.paymentProvider);
