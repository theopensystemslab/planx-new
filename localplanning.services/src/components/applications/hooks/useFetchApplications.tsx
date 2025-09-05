import { queryClient } from "@lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import { PUBLIC_PLANX_REST_API_URL } from "astro:env/client";
import { useSearchParams } from "./useSearchParams";

interface BaseApplication {
  id: string;
  service: {
    name: string;
  };
  team: {
    name: string;
  };
  address: string | null;
  createdAt: string;
}

export type DraftApplication = BaseApplication & {
  status: "draft",
  expiresAt: string;
  serviceUrl: string;
};

export type AwaitingPaymentApplication = BaseApplication & {
  status: "awaiting-payment"
  expiresAt: string;
};

export type SubmittedApplication = BaseApplication & {
  status: "submitted"
  submittedAt: string;
};

type Application = DraftApplication | AwaitingPaymentApplication | SubmittedApplication;

export type ApplicationsResponse = Application[];

export const useFetchApplications = () => {  
  const { token, email } = useSearchParams();

  const { data: applications = { drafts: [], submitted: [] }, isLoading, error } = useQuery<ApplicationsResponse>({
    queryKey: ["fetchApplications"],
    queryFn: async () => {
      const response = await fetch(`${PUBLIC_PLANX_REST_API_URL}/lps/applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, email })
      });

      if (!response.ok) {
        const { error = "UNHANDLED_ERROR" } = await response.json();
        throw new Error(error);
      }

      const applications = await response.json();
      return applications;
    },
    // Retain cache of applications for whilst tab remains open
    // Data could only be refetch with a new magic link
    staleTime: Infinity,
    gcTime: Infinity,
    retry: 2,
  }, queryClient);

  return {
    applications,
    isLoading,
    error,
  };
};