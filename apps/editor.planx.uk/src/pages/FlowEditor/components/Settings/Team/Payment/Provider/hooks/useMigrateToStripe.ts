import { useMutation } from "@tanstack/react-query";
import { migrateToStripe } from "lib/api/stripe/requests";

export const useMigrateToStripe = () =>
  useMutation({
    mutationFn: migrateToStripe,
  });
