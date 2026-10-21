import { useMutation } from "@tanstack/react-query";
import { revertToGovPay } from "lib/api/stripe/requests";

export const useRevertToGovPay = () =>
  useMutation({
    mutationFn: revertToGovPay,
  });
