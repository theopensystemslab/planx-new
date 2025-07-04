import { queryClient } from "@lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import { PUBLIC_PLANX_REST_API_URL } from "astro:env/client";

interface Application {
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

export type DraftApplication = Application & {
  expiresAt: string;
  serviceUrl: string;
};

export type SubmittedApplication = Application & {
  submittedAt: string;
};

export interface ApplicationsResponse {
  drafts: DraftApplication[];
  submitted: SubmittedApplication[];
}

export const useFetchApplications = () => {  
  const urlParams = new URLSearchParams(window.location.search)
  const token = urlParams.get("token");
  const email = urlParams.get("email");
  const hasUsedMagicLink = Boolean(token && email);

  const { data: applications = { drafts: [], submitted: [] }, isLoading, error } = useQuery<ApplicationsResponse>({
    queryKey: ["fetchApplications"],
    queryFn: async () => {
      const response = await fetch(`${PUBLIC_PLANX_REST_API_URL}/lps/applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, email })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch applications: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const applications = await response.json();
      return applications;
    },
    enabled: hasUsedMagicLink,
    // Retain cache of applications for whilst tab remains open
    // Data could only be refetch with a new magic link
    staleTime: Infinity,
    gcTime: Infinity,
    retry: 2,
  }, queryClient);

  return {
    applications,
    isLoading,
    hasUsedMagicLink,
    error,
  };
};